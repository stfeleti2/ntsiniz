import React, { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Line, G } from 'react-native-svg'
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

import type { PitchReading } from '@/core/pitch/pitchEngine'
import type { GhostGuideState } from '@/core/drills/runnerMachine'
import { isLowEndMode, useSkiaOverlays } from '@/core/config/flags'
import { getQualityConfigSnapshot } from '@/core/perf/qualityRuntime'

// Memoized SVG definitions (gradients) so we don't recreate them on every render.
const GhostSvgDefsInner = () => (
  <Defs>
    <LinearGradient id="ghostBg" x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0" stopOpacity="0.10" />
      <Stop offset="1" stopOpacity="0.00" />
    </LinearGradient>
    <RadialGradient id="ghostGlow" cx="50%" cy="50%" r="50%">
      <Stop offset="0" stopOpacity="0.22" />
      <Stop offset="1" stopOpacity="0.00" />
    </RadialGradient>
  </Defs>
)
const GhostSvgDefs = React.memo(GhostSvgDefsInner)

export type GhostSegment = {
  startMs: number
  endMs: number
  midi: number
}

export type GhostGuideOverlayProps = {
  /** Current epoch ms. */
  nowMs: number
  /** User live pitch reading (may be null). */
  reading: PitchReading | null

  /** Drill mode: runner telemetry; OR Performance mode: explicit plan. */
  drill?: GhostGuideState | null
  performancePlan?: { startedAtMs: number; segments: GhostSegment[]; toleranceCents: number } | null

  /** Visual tuning. */
  msPerPx?: number
  semitoneRange?: number

  /** Pro-only: adds small HUD labels (note name + cents) without clutter. */
  advanced?: boolean
}

const AnimatedRect = Animated.createAnimatedComponent(Rect)

/**
 * Ghost Guide Overlay
 * - Fixed playhead (center)
 * - Target bars scroll right→left
 * - User pitch trace is expressed as a small “comet” marker near playhead
 *   (keeps JS work low; avoids per-frame polyline updates)
 */
function GhostGuideOverlayInner({
  nowMs,
  reading,
  drill,
  performancePlan,
  msPerPx = 7,
  semitoneRange = 12,
  advanced = false,
}: GhostGuideOverlayProps) {
  // Dev-only render counter for perf debugging (kept out of prod behavior).
  const renderCountRef = React.useRef({ n: 0, lastLogAt: Date.now() })
  if (__DEV__) {
    renderCountRef.current.n += 1
    const now = Date.now()
    if (now - renderCountRef.current.lastLogAt >= 2000) {
      console.log('[GhostGuideOverlay] renders:', renderCountRef.current.n)
      renderCountRef.current.lastLogAt = now
    }
  }
  const mode = drill ? 'drill' : performancePlan ? 'performance' : 'none'

  // Timeline + targets (independent of layout size)
  const { segments, toleranceCents, targetMidi, tMs } = useMemo(() => {
    if (mode === 'performance' && performancePlan) {
      const t = nowMs - performancePlan.startedAtMs
      const currentTarget = pickTargetMidi(performancePlan.segments, t)
      return {
        segments: performancePlan.segments,
        toleranceCents: performancePlan.toleranceCents,
        targetMidi: currentTarget ?? 69,
        tMs: t,
      }
    }
    if (mode === 'drill' && drill) {
      const activeStart = drill.activeStartedAt || nowMs
      const segs: GhostSegment[] = drill.stepTargetsMidi.map((m, i) => ({
        startMs: (drill.countdownEndsAt || activeStart) + i * drill.holdMs,
        endMs: (drill.countdownEndsAt || activeStart) + (i + 1) * drill.holdMs,
        midi: m,
      }))
      return {
        segments: segs,
        toleranceCents: drill.tuneWindowCents,
        targetMidi: drill.targetMidi,
        tMs: nowMs,
      }
    }
    return { segments: [], toleranceCents: 25, targetMidi: 69, tMs: nowMs }
  }, [mode, performancePlan, drill, nowMs])

  return (
    <View style={styles.wrap} pointerEvents="none">
      <AutoSize>
        {({ width, height }) => {
          return (
            <GhostGuideCanvas
              nowMs={nowMs}
              width={width}
              height={height}
              reading={reading}
              segments={segments}
              toleranceCents={toleranceCents}
              targetMidi={targetMidi}
              tMs={tMs}
              msPerPx={msPerPx}
              semitoneRange={semitoneRange}
              advanced={advanced}
            />
          )
        }}
      </AutoSize>
    </View>
  )
}

type GhostGuideCanvasProps = {
  nowMs: number
  width: number
  height: number
  reading: PitchReading | null
  segments: GhostSegment[]
  toleranceCents: number
  targetMidi: number
  /** Timeline cursor in ms (drill: epoch; performance: relative). */
  tMs: number
  msPerPx: number
  semitoneRange: number
  advanced: boolean
}

function GhostGuideCanvas({
  nowMs,
  width,
  height,
  reading,
  segments,
  toleranceCents,
  targetMidi,
  tMs,
  msPerPx,
  semitoneRange,
  advanced,
}: GhostGuideCanvasProps) {
  const renderCounter = React.useRef({ n: 0, windowN: 0, t0: Date.now(), lastLogAt: Date.now() })
  if (__DEV__) {
    const now = Date.now()
    renderCounter.current.n += 1
    renderCounter.current.windowN += 1
    // Log at most every 2 seconds so storms are detected quickly.
    if (now - renderCounter.current.lastLogAt >= 2000) {
      const dt = Math.max(1, now - renderCounter.current.t0)
      const rps = (renderCounter.current.windowN * 1000) / Math.max(1, now - renderCounter.current.lastLogAt)
      console.log('[GhostGuideCanvas] renders:', renderCounter.current.n, 'windowRps:', rps.toFixed(2), 'elapsedMs:', dt)
      if (rps > 2.5) {
        console.warn('[GhostGuideCanvas] high render rate; consider Reanimated-only marker updates')
      }
      renderCounter.current.windowN = 0
      renderCounter.current.lastLogAt = now
    }
  }
  const centerX = width / 2

  // Judgement (anti-jitter: confidence gates opacity)
  const userCents = reading?.cents ?? 0
  const conf = typeof reading?.confidence === 'number' ? reading!.confidence : 0
  const hasVoice = !!reading && conf >= 0.2
  const abs = Math.abs(userCents)
  const onTarget = hasVoice && abs <= toleranceCents
  const near = hasVoice && !onTarget && abs <= toleranceCents * 1.75

  const targetNote = useMemo(() => midiToNoteName(targetMidi), [targetMidi])

  const midiToY = (midi: number) => {
    const dy = (targetMidi - midi) / semitoneRange
    return height * 0.5 + dy * (height * 0.42)
  }

  const bandPx = (toleranceCents / 100) * (height * 0.42) / semitoneRange
  const traceOpacity = hasVoice ? clamp(0.25 + conf * 0.75, 0.2, 1) : 0.12

  // Streak aura: lightweight "Guitar Hero" reward (subtle, non-anxious)
  const streakAura = useSharedValue(0)
  const auraStyle = useAnimatedStyle(() => {
    return { opacity: streakAura.value * 0.85 }
  })
  const streakRef = React.useRef({
    count: 0,
    prevOn: false,
    lastHitAt: 0,
    offSince: 0,
    silenceSince: 0,
  })

  React.useEffect(() => {
    const s = streakRef.current

    if (!hasVoice) {
      if (!s.silenceSince) s.silenceSince = nowMs
      if (nowMs - s.silenceSince > 900) {
        s.count = 0
        s.prevOn = false
      }
      return
    }
    s.silenceSince = 0

    if (onTarget) {
      // Count a new "hit" on transition into onTarget, with a small debounce.
      if (!s.prevOn && nowMs - s.lastHitAt > 220) {
        s.count += 1
        s.lastHitAt = nowMs
        s.offSince = 0
        if (s.count >= 3) {
          streakAura.value = 1
          streakAura.value = withTiming(0, { duration: 760, easing: Easing.out(Easing.quad) })
        }
      }
    } else {
      if (s.prevOn) s.offSince = nowMs
      if (s.offSince && nowMs - s.offSince > 650) {
        s.count = 0
      }
    }

    s.prevOn = onTarget
  }, [nowMs, hasVoice, onTarget, streakAura])

  // Pulse for the playhead halo (Aurora vibe)
  const pulse = useSharedValue(0)
  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    )
  }, [pulse])

  const haloStyle = useAnimatedStyle(() => {
    const s = 0.92 + 0.14 * pulse.value
    const o = 0.20 + 0.12 * pulse.value
    return {
      transform: [{ scale: s }],
      opacity: o,
    }
  })

  // PERF: pitch marker uses shared values + animated props (no React re-render needed)
  const userCentsSV = useSharedValue(userCents)
  const confSV = useSharedValue(conf)
  const targetMidiSV = useSharedValue(targetMidi)

  React.useEffect(() => {
    userCentsSV.value = userCents
    confSV.value = conf
    targetMidiSV.value = targetMidi
  }, [userCents, conf, targetMidi, userCentsSV, confSV, targetMidiSV])

  const baseY = height * 0.5
  const scaleY = (height * 0.42) / semitoneRange

  const userYDV = useDerivedValue(() => {
    const midiFloat = targetMidiSV.value + userCentsSV.value / 100
    const dy = targetMidiSV.value - midiFloat
    return baseY + dy * scaleY
  }, [baseY, scaleY])

  const userOpacityDV = useDerivedValue(() => {
    const c = confSV.value
    const voiced = c >= 0.2
    const o = voiced ? clamp(0.25 + c * 0.75, 0.2, 1) : 0.12
    return o
  })

  const userCoreProps = useAnimatedProps(() => {
    return {
      y: userYDV.value - 3.5,
      opacity: userOpacityDV.value,
    } as any
  })

  const userGlowProps = useAnimatedProps(() => {
    return {
      y: userYDV.value - 7.5,
      opacity: userOpacityDV.value * 0.18,
    } as any
  })

  // Grid lines (memoized: layout + target only)
  const gridLines = useMemo(() => {
    const out: React.ReactNode[] = []
    for (let i = -6; i <= 6; i += 1) {
      const y = midiToY(targetMidi + i)
      const strong = i === 0
      out.push(
        <Line
          key={`g${i}`}
          x1={0}
          x2={width}
          y1={y}
          y2={y}
          stroke={strong ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)'}
          strokeWidth={strong ? 1.5 : 1}
        />,
      )
    }
    return out
  }, [width, targetMidi, semitoneRange, height])

  const activeSeg = segments.find((s) => tMs >= s.startMs && tMs <= s.endMs)

  // Visible ghost bars (still driven by timeline; cheap at 20fps)
  const ghostBars = useMemo(() => {
    const out: React.ReactNode[] = []
    for (let idx = 0; idx < segments.length; idx += 1) {
      const s = segments[idx]
      const startX = centerX + (s.startMs - tMs) / msPerPx
      const endX = centerX + (s.endMs - tMs) / msPerPx
      if (endX < -40 || startX > width + 40) continue
      const y = midiToY(s.midi)
      const h = Math.max(10, bandPx * 2.4)
      const w = Math.max(8, endX - startX)

      const isActive =
        !!activeSeg &&
        activeSeg.startMs === s.startMs &&
        activeSeg.endMs === s.endMs &&
        activeSeg.midi === s.midi

      const fillW = isActive ? clamp(centerX - startX, 0, w) : 0
      const showFill = isActive && onTarget && hasVoice && fillW > 2

      out.push(
        <G key={`seg${idx}`}>
          <Rect x={startX} y={y - h / 2} width={w} height={h} rx={999} fill="url(#aurora)" opacity={0.18} />
          <Rect x={startX} y={y - h / 2} width={w} height={h} rx={999} fill="url(#aurora)" opacity={0.32} />

          {showFill ? (
            <G>
              <Rect x={startX} y={y - h / 2} width={fillW} height={h} rx={999} fill="url(#auroraFill)" opacity={0.62} />
              <Rect x={centerX - 1} y={y - h / 2} width={2} height={h} rx={999} fill="rgba(255,255,255,0.22)" opacity={0.85} />
            </G>
          ) : null}
        </G>,
      )
    }
    return out
  }, [segments, centerX, tMs, msPerPx, width, targetMidi, semitoneRange, height, bandPx, activeSeg, onTarget, hasVoice])

  const userY = midiToY(targetMidi + userCents / 100)
  const userColor = onTarget
    ? 'rgba(140, 255, 206, 0.95)'
    : near
      ? 'rgba(255, 214, 140, 0.90)'
      : 'rgba(255, 120, 140, 0.78)'

  const cue = !hasVoice ? null : onTarget ? null : userCents > 0 ? '↓' : '↑'

  // Premium guardrail: degrade *effects*, not layout.
  const quality = getQualityConfigSnapshot()
  const detail = isLowEndMode() ? 'LOW' : (quality.ghostOverlayDetail ?? 'BALANCED')

  return (
    <View style={styles.canvas}>
      <Svg width={width} height={height}>
        {detail === 'LOW' ? null : <AuroraDefs />}

        <Rect x={0} y={0} width={width} height={height} fill="rgba(0,0,0,0.18)" />
        {gridLines}
        {ghostBars as any}

        <Rect
          x={centerX - 2}
          y={midiToY(targetMidi) - bandPx}
          width={4}
          height={bandPx * 2}
          rx={999}
          fill="rgba(255,255,255,0.16)"
        />

        <Line x1={centerX} x2={centerX} y1={0} y2={height} stroke="rgba(255,255,255,0.14)" strokeWidth={1} />

        <AnimatedRect x={centerX - 34} width={68} height={7} rx={999} fill={userColor} animatedProps={userCoreProps} />
        <AnimatedRect x={centerX - 48} width={96} height={15} rx={999} fill={userColor} animatedProps={userGlowProps} />
      </Svg>

      {detail === 'LOW' ? null : (
        <Animated.View style={[styles.auraWrap, auraStyle]} pointerEvents="none">
          <Svg width={width} height={height}>
            <StreakAuraDefs />
            <Rect x={0} y={0} width={width} height={height} fill="url(#streakAura)" />
          </Svg>
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.halo,
          haloStyle,
          {
            left: centerX - 56,
            top: midiToY(targetMidi) - 56,
            borderColor: onTarget ? 'rgba(140,255,206,0.32)' : 'rgba(160,190,255,0.22)',
          },
        ]}
      />

      {cue ? (
        <View
          style={[
            styles.cue,
            {
              left: centerX + 18,
              top: userY - 16,
              borderColor: userColor,
              opacity: traceOpacity,
            },
          ]}
        >
          <View style={styles.cueDot} />
        </View>
      ) : null}

      {advanced ? (
        <View style={[styles.hud, { left: 12, top: 10 }]}>
          <View style={styles.hudPill}>
            <View style={styles.hudDot} />
            <View style={{ gap: 2 }}>
              <TextMini>{targetNote}</TextMini>
              <TextMiniMuted>{hasVoice ? `${Math.round(userCents)}c` : '—'}</TextMiniMuted>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  )
}

const AuroraDefs = React.memo(function AuroraDefs() {
  return (
    <GhostSvgDefs />
  )
})

const StreakAuraDefs = React.memo(function StreakAuraDefs() {
  return (
    <Defs>
      <RadialGradient id="streakAura" cx="50%" cy="50%" rx="72%" ry="72%" fx="50%" fy="50%">
        <Stop offset="0%" stopColor="rgba(0,0,0,0)" />
        <Stop offset="58%" stopColor="rgba(0,0,0,0)" />
        <Stop offset="100%" stopColor="rgba(160, 190, 255, 0.26)" />
      </RadialGradient>
    </Defs>
  )
})

function midiToNoteName(midi: number) {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const n = Math.round(midi)
  const name = names[((n % 12) + 12) % 12]
  const octave = Math.floor(n / 12) - 1
  return `${name}${octave}`
}

function pickTargetMidi(segments: GhostSegment[], tMs: number) {
  const s = segments.find((x) => tMs >= x.startMs && tMs <= x.endMs)
  return s?.midi
}

function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x))
}

function TextMini({ children }: { children: React.ReactNode }) {
  return (
    <View>
      {/* Using a View + inline styles avoids importing the full Typography system into this hot path. */}
      <Animated.Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 12, fontWeight: '800' }}>{children as any}</Animated.Text>
    </View>
  )
}

function TextMiniMuted({ children }: { children: React.ReactNode }) {
  return (
    <View>
      <Animated.Text style={{ color: 'rgba(255,255,255,0.62)', fontSize: 11, fontWeight: '700' }}>{children as any}</Animated.Text>
    </View>
  )
}

/** Minimal auto-size helper to avoid new deps. */
function AutoSize({ children }: { children: (s: { width: number; height: number }) => React.ReactNode }) {
  const [size, setSize] = React.useState({ width: 0, height: 0 })
  return (
    <View
      style={{ flex: 1 }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout
        if (!width || !height) return
        setSize({ width, height })
      }}
    >
      {size.width > 0 && size.height > 0 ? children(size) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
  auraWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  halo: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 112,
    borderWidth: 1,
    backgroundColor: 'rgba(120,150,255,0.06)',
  },
  cue: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cueDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },

  hud: {
    position: 'absolute',
  },
  hudPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  hudDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(160,190,255,0.85)',
  },
})


/**
 * Runtime-switchable overlay:
 * - Prefer Skia when enabled + available (smoother on low-end devices).
 * - Fallback to SVG/Reanimated implementation.
 */
export const GhostGuideOverlay = React.memo((props: GhostGuideOverlayProps) => {
  if (isLowEndMode()) return <GhostGuideOverlayInner {...props} />
  if (!useSkiaOverlays()) return <GhostGuideOverlayInner {...props} />

  // Skia is an optional dep. If not installed/linked, fall back safely.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('./GhostGuideOverlaySkia') as typeof import('./GhostGuideOverlaySkia')
    const Cmp = mod.GhostGuideOverlaySkia
    return <Cmp {...props} />
  } catch {
    return <GhostGuideOverlayInner {...props} />
  }
})
