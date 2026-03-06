import React, { useMemo } from 'react'
import { View } from 'react-native'

import type { PitchReading } from '@/core/pitch/pitchEngine'
import type { GhostGuideState } from '@/core/drills/runnerMachine'

// Skia types are optional at runtime. This file is only imported when Skia is available.
import {
  Canvas,
  Rect,
  Line,
  Group,
  RoundedRect,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia'

export type GhostSegment = {
  startMs: number
  endMs: number
  midi: number
}

export type GhostGuideOverlayProps = {
  nowMs: number
  reading: PitchReading | null
  drill?: GhostGuideState | null
  performancePlan?: { startedAtMs: number; segments: GhostSegment[]; toleranceCents: number } | null
  msPerPx?: number
  semitoneRange?: number
  advanced?: boolean
}

/**
 * Skia version of Ghost Guide overlay.
 *
 * Intent:
 * - Draw-only (no heavy per-frame JS layout)
 * - Cull segments outside viewport
 * - Keep visuals simple + fast
 */
export function GhostGuideOverlaySkia({
  nowMs,
  reading,
  drill,
  performancePlan,
  msPerPx = 7,
  semitoneRange = 12,
}: GhostGuideOverlayProps) {
  const mode = drill ? 'drill' : performancePlan ? 'performance' : 'none'

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
    <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} pointerEvents="none">
      <AutoSize>
        {({ width, height }) => (
          <GhostGuideCanvas
            width={width}
            height={height}
            reading={reading}
            segments={segments}
            toleranceCents={toleranceCents}
            targetMidi={targetMidi}
            tMs={tMs}
            msPerPx={msPerPx}
            semitoneRange={semitoneRange}
          />
        )}
      </AutoSize>
    </View>
  )
}

function GhostGuideCanvas({
  width,
  height,
  reading,
  segments,
  toleranceCents,
  targetMidi,
  tMs,
  msPerPx,
  semitoneRange,
}: {
  width: number
  height: number
  reading: PitchReading | null
  segments: GhostSegment[]
  toleranceCents: number
  targetMidi: number
  tMs: number
  msPerPx: number
  semitoneRange: number
}) {
  const centerX = width / 2
  const viewStartMs = tMs - centerX * msPerPx - 400
  const viewEndMs = tMs + centerX * msPerPx + 400

  const midiToY = (midi: number) => {
    const dy = (targetMidi - midi) / semitoneRange
    return height * 0.5 + dy * (height * 0.42)
  }

  const bandPx = (toleranceCents / 100) * (height * 0.42) / semitoneRange
  const targetY = midiToY(targetMidi)

  // User marker (small dot near playhead)
  const userConf = reading?.confidence ?? 0
  const userHasVoice = !!reading && userConf >= 0.2
  const userY = userHasVoice ? midiToY(targetMidi + (reading!.cents / 100)) : targetY

  return (
    <Canvas style={{ width, height }}>
      {/* Target band */}
      <RoundedRect x={0} y={targetY - bandPx} width={width} height={bandPx * 2} r={12} opacity={0.12}>
        <LinearGradient start={vec(0, targetY)} end={vec(width, targetY)} colors={['#37F2C6', '#8A5CFF']} />
      </RoundedRect>

      {/* Target segments (culled to viewport) */}
      <Group opacity={0.22}>
        {segments
          .filter((s) => s.endMs >= viewStartMs && s.startMs <= viewEndMs)
          .map((s, idx) => {
            const x1 = centerX + (s.startMs - tMs) / msPerPx
            const x2 = centerX + (s.endMs - tMs) / msPerPx
            const y = midiToY(s.midi)
            return (
              <RoundedRect key={`${idx}`} x={x1} y={y - bandPx} width={Math.max(2, x2 - x1)} height={bandPx * 2} r={10}>
                <LinearGradient start={vec(x1, y)} end={vec(x2, y)} colors={['#37F2C6', '#8A5CFF']} />
              </RoundedRect>
            )
          })}
      </Group>

      {/* Playhead */}
      <Line p1={vec(centerX, 0)} p2={vec(centerX, height)} color="rgba(255,255,255,0.18)" strokeWidth={2} />

      {/* User dot */}
      <Rect
        x={centerX - 5}
        y={userY - 5}
        width={10}
        height={10}
        color={userHasVoice ? 'rgba(55,242,198,0.9)' : 'rgba(255,255,255,0.22)'}
      />
    </Canvas>
  )
}

function pickTargetMidi(segs: GhostSegment[], tMs: number): number | null {
  for (const s of segs) {
    if (tMs >= s.startMs && tMs < s.endMs) return s.midi
  }
  return segs.length ? segs[segs.length - 1]!.midi : null
}

// Simple layout measurer to avoid adding new deps.
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
