import React from 'react'
import { StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Path, Polyline, Stop } from 'react-native-svg'
import { Box, Pressable, Text } from '@/ui/primitives'
import { Card } from '@/ui/components/kit'
import { Button } from '@/ui/components/kit'
import { SparkleBurst } from '@/ui/components/SparkleBurst'
import { GhostGuideOverlay } from '@/ui/ghost'

export type HexagonState =
  | 'idle'
  | 'ready'
  | 'listening'
  | 'voiceDetected'
  | 'tracking'
  | 'locked'
  | 'unstable'
  | 'success'
  | 'needsRetry'
  | 'paused'

const stateMeta: Record<HexagonState, { glow: string; border: string; label: string }> = {
  idle: { glow: 'rgba(140, 116, 255, 0.2)', border: 'rgba(186, 176, 245, 0.7)', label: 'Idle' },
  ready: { glow: 'rgba(156, 133, 255, 0.28)', border: '#C8BCFF', label: 'Ready' },
  listening: { glow: 'rgba(128, 229, 255, 0.26)', border: '#86EFFF', label: 'Listening' },
  voiceDetected: { glow: 'rgba(132, 247, 195, 0.28)', border: '#92F9CE', label: 'Voice detected' },
  tracking: { glow: 'rgba(151, 203, 255, 0.26)', border: '#9FD4FF', label: 'Tracking' },
  locked: { glow: 'rgba(255, 223, 145, 0.26)', border: '#FFE09A', label: 'Locked' },
  unstable: { glow: 'rgba(255, 141, 186, 0.24)', border: '#FFB0CC', label: 'Unstable' },
  success: { glow: 'rgba(132, 255, 189, 0.3)', border: '#7CF4B8', label: 'Success' },
  needsRetry: { glow: 'rgba(255, 175, 112, 0.24)', border: '#FFC48E', label: 'Retry' },
  paused: { glow: 'rgba(190, 194, 222, 0.2)', border: '#D4D9F5', label: 'Paused' },
}

const UI_STRINGS = {
  demoPill: 'Demo',
  techniquePill: 'Technique',
  target: 'Target',
  stability: 'Stability',
  confidence: 'Confidence',
  current: 'Current',
  locked: 'Locked',
  open: 'Open',
  recovery: 'Recovery',
}

export function BrandWorldBackdrop({ children }: { children?: React.ReactNode }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={['#070911', '#171332', '#251A49', '#110E23']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <View style={[styles.orb, styles.orbLeft]} />
      <View style={[styles.orb, styles.orbRight]} />
      <View style={[styles.orb, styles.orbBottom]} />
      <View style={styles.vignette} />
      {children}
    </View>
  )
}

export function HexagonHero({
  state = 'idle',
  size = 220,
  title,
  subtitle,
  progress = 0.5,
}: {
  state?: HexagonState
  size?: number
  title?: string
  subtitle?: string
  progress?: number
}) {
  const meta = stateMeta[state]
  const points = hexagonPath(size)
  const innerPoints = hexagonPath(size * 0.72)

  return (
    <Box style={{ alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: meta.glow,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: meta.border,
          shadowOpacity: 0.38,
          shadowRadius: 26,
          shadowOffset: { width: 0, height: 14 },
        }}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <SvgLinearGradient id="hexGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#F7F2FF" stopOpacity="0.92" />
              <Stop offset="55%" stopColor={meta.border} stopOpacity="0.88" />
              <Stop offset="100%" stopColor="#5F44CF" stopOpacity="0.8" />
            </SvgLinearGradient>
            <SvgLinearGradient id="hexInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
              <Stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
            </SvgLinearGradient>
          </Defs>
          <Path d={points} fill="rgba(17, 11, 37, 0.78)" stroke="url(#hexGlow)" strokeWidth={4} />
          <Path d={innerPoints} fill="url(#hexInner)" stroke="rgba(255,255,255,0.18)" strokeWidth={2} />
          <Circle cx={size / 2} cy={size / 2} r={size * 0.12} fill={meta.border} opacity={0.55} />
          <Circle cx={size / 2} cy={size / 2} r={size * 0.22} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={size * 0.06} />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.22}
            fill="none"
            stroke={meta.border}
            strokeWidth={size * 0.045}
            strokeDasharray={`${Math.max(12, progress * 180)} ${Math.max(20, 220 - progress * 180)}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
      </View>
      {title ? <Text size="lg" weight="bold">{title}</Text> : null}
      {subtitle ? <Text size="sm" tone="muted" style={{ textAlign: 'center' }}>{subtitle}</Text> : null}
    </Box>
  )
}

export function HexagonStateRenderer(props: React.ComponentProps<typeof HexagonHero>) {
  return <HexagonHero {...props} />
}

export function StatusPill({ state, label }: { state: HexagonState | 'noisy' | 'blocked' | 'retry'; label?: string }) {
  const actual = state in stateMeta ? (state as HexagonState) : state === 'blocked' ? 'paused' : state === 'noisy' ? 'unstable' : 'needsRetry'
  const meta = stateMeta[actual]
  return (
    <Box
      style={{
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: meta.glow,
        borderWidth: 1,
        borderColor: meta.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        shadowColor: '#04040D',
        shadowOpacity: 0.22,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 11 }}>{statusGlyph(state)}</Text>
      <Text size="sm" weight="semibold">{label ?? meta.label}</Text>
    </Box>
  )
}

export function StatusIcon({ state }: { state: HexagonState | 'noisy' | 'blocked' | 'retry' }) {
  return <Text>{statusGlyph(state)}</Text>
}

export function ChoiceCardGroup<T extends string>({
  title,
  value,
  options,
  onChange,
}: {
  title?: string
  value: T | null
  options: Array<{ id: T; title: string; subtitle?: string }>
  onChange: (next: T) => void
}) {
  return (
    <Box style={{ gap: 10 }}>
      {title ? <Text size="lg" weight="bold">{title}</Text> : null}
      {options.map((option) => {
        const selected = option.id === value
        return (
          <Card
            key={option.id}
            tone={selected ? 'glow' : 'default'}
            style={{ padding: 0, overflow: 'hidden' }}
          >
            <Pressable
              onPress={() => onChange(option.id)}
              style={{
                padding: 16,
                gap: 6,
                borderWidth: selected ? 1 : 0,
                borderColor: selected ? 'rgba(220, 212, 255, 0.42)' : 'transparent',
              }}
            >
              <Text size="md" weight="bold">{option.title}</Text>
              {option.subtitle ? <Text size="sm" tone="muted">{option.subtitle}</Text> : null}
            </Pressable>
          </Card>
        )
      })}
    </Box>
  )
}

export function TrustBulletRow({ bullets }: { bullets: string[] }) {
  return (
    <Box style={{ gap: 8 }}>
      {bullets.map((bullet, idx) => (
        <Box key={`${bullet}-${idx}`} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <Text>{idx === 0 ? '🔒' : idx === 1 ? '🎙️' : '✨'}</Text>
          <Text size="sm" tone="muted" style={{ flex: 1 }}>{bullet}</Text>
        </Box>
      ))}
    </Box>
  )
}

export function PrimaryActionBar({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  helperText,
}: {
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  helperText?: string
}) {
  return (
    <Card tone="glow">
      <Box style={{ gap: 10 }}>
        {helperText ? <Text size="sm" tone="muted">{helperText}</Text> : null}
        <Button text={primaryLabel} onPress={onPrimary} />
        {secondaryLabel && onSecondary ? <Button text={secondaryLabel} variant="ghost" onPress={onSecondary} /> : null}
      </Box>
    </Card>
  )
}

export function VoiceGuideCard({ title, body, pill }: { title: string; body: string; pill?: string }) {
  return (
    <Card tone="glow">
      <Box style={{ gap: 8 }}>
        {pill ? <StatusPill state="ready" label={pill} /> : null}
        <Text size="lg" weight="bold">{title}</Text>
        <Text size="sm" tone="muted">{body}</Text>
      </Box>
    </Card>
  )
}

export function CoachInset({ title, body }: { title: string; body: string }) {
  return (
    <Card tone="elevated">
      <Text size="md" weight="bold">{title}</Text>
      <Text size="sm" tone="muted">{body}</Text>
    </Card>
  )
}

export function DemoLoopCard({ title, body }: { title: string; body: string }) {
  return <VoiceGuideCard title={title} body={body} pill={UI_STRINGS.demoPill} />
}

export function TechniqueVisualCard({ title, body }: { title: string; body: string }) {
  return <VoiceGuideCard title={title} body={body} pill={UI_STRINGS.techniquePill} />
}

export function AdaptiveInstructionBlock({ title, body, state }: { title: string; body: string; state?: HexagonState }) {
  return (
    <Card tone="elevated">
      <Box style={{ gap: 8 }}>
        <StatusPill state={state ?? 'tracking'} />
        <Text size="md" weight="bold">{title}</Text>
        <Text size="sm" tone="muted">{body}</Text>
      </Box>
    </Card>
  )
}

export function LivePitchTrace({ values, color = '#C8BCFF' }: { values: number[]; color?: string }) {
  const safe = values.length ? values : [0.5, 0.52, 0.48]
  const points = safe
    .slice(-32)
    .map((value, index, list) => `${(index / Math.max(1, list.length - 1)) * 220},${60 - clampValue(value, 0, 1) * 50}`)
    .join(' ')

  return (
    <Svg width={220} height={64}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  )
}

export function TargetRail({ progress }: { progress: number }) {
  return <MeterBar label={UI_STRINGS.target} value={progress} color="#C8BCFF" />
}

export function RangeRail({ minLabel, maxLabel, progress }: { minLabel: string; maxLabel: string; progress: number }) {
  return <MeterBar label={`${minLabel} → ${maxLabel}`} value={progress} color="#76F7A6" />
}

export function CurrentZoneChip({ label }: { label: string }) {
  return <StatusPill state="tracking" label={label} />
}

export function StabilityMeter({ value }: { value: number }) {
  return <MeterBar label={UI_STRINGS.stability} value={1 - clampValue(value / 30, 0, 1)} color="#7FD8FF" />
}

export function EnvironmentChip({ state, label }: { state: 'ready' | 'listening' | 'noisy' | 'blocked'; label: string }) {
  return <StatusPill state={state} label={label} />
}

export function ConfidenceIndicator({ value }: { value: number }) {
  return <MeterBar label={UI_STRINGS.confidence} value={value} color="#FFD472" />
}

export function RewardBurst({ active }: { active: boolean }) {
  return <SparkleBurst enabled={active} triggerKey={active ? 'reward-burst-active' : 'reward-burst-idle'} />
}

export function StartingProfileCard({ title, body, items }: { title: string; body: string; items: string[] }) {
  return <InfoCard title={title} body={body} items={items} />
}

export function VoiceSnapshotCard({ title, body, items }: { title: string; body: string; items: string[] }) {
  return <InfoCard title={title} body={body} items={items} />
}

export function ResultAnnotationCard({ title, body }: { title: string; body: string }) {
  return <InfoCard title={title} body={body} items={[]} />
}

export function PlaybackInsightCard({ title, body }: { title: string; body: string }) {
  return <InfoCard title={title} body={body} items={[]} />
}

export function NextStepCard({ title, body, cta, onPress }: { title: string; body: string; cta: string; onPress: () => void }) {
  return (
    <Card tone="glow">
      <Box style={{ gap: 8 }}>
        <Text size="lg" weight="bold">{title}</Text>
        <Text size="sm" tone="muted">{body}</Text>
        <Button text={cta} onPress={onPress} />
      </Box>
    </Card>
  )
}

export function JourneyPath({
  items,
  activeId,
  lockedIds = [],
}: {
  items: Array<{ id: string; title: string }>
  activeId?: string | null
  lockedIds?: string[]
}) {
  return (
    <Box style={{ gap: 10 }}>
      {items.map((item, index) => {
        const active = item.id === activeId
        const locked = lockedIds.includes(item.id)
        return (
          <Card key={item.id} tone={active ? 'glow' : 'default'}>
            <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Box
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active ? 'rgba(200,188,255,0.24)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <Text size="sm" weight="bold">{locked ? '🔒' : index + 1}</Text>
              </Box>
              <Text size="md" weight="bold" style={{ flex: 1 }}>{item.title}</Text>
              {active ? <StatusPill state="ready" label={UI_STRINGS.current} /> : locked ? <StatusPill state="blocked" label={UI_STRINGS.locked} /> : <StatusPill state="success" label={UI_STRINGS.open} />}
            </Box>
          </Card>
        )
      })}
    </Box>
  )
}

export function MilestoneCard({ title, body, stat }: { title: string; body: string; stat: string }) {
  return (
    <Card tone="elevated">
      <Text size="sm" tone="muted">{title}</Text>
      <Text size="xl" weight="bold">{stat}</Text>
      <Text size="sm" tone="muted">{body}</Text>
    </Card>
  )
}

export function ChapterHeroCard({
  title,
  subtitle,
  stageLabel,
  cta,
  onPress,
}: {
  title: string
  subtitle: string
  stageLabel: string
  cta?: string
  onPress?: () => void
}) {
  return (
    <Card tone="glow">
      <Box style={{ gap: 10 }}>
        <StatusPill state="ready" label={stageLabel} />
        <Text size="xl" weight="bold">{title}</Text>
        <Text size="sm" tone="muted">{subtitle}</Text>
        {cta && onPress ? <Button text={cta} onPress={onPress} /> : null}
      </Box>
    </Card>
  )
}

export function InlineRecoveryCard({
  title,
  body,
  action,
  onPress,
}: {
  title: string
  body: string
  action: string
  onPress: () => void
}) {
  return (
    <Card tone="warning">
      <Box style={{ gap: 8 }}>
        <StatusPill state="needsRetry" label={UI_STRINGS.recovery} />
        <Text size="lg" weight="bold">{title}</Text>
        <Text size="sm" tone="muted">{body}</Text>
        <Button text={action} onPress={onPress} />
      </Box>
    </Card>
  )
}

export { GhostGuideOverlay }

function MeterBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Box style={{ gap: 6 }}>
      <Text size="sm" tone="muted">{label}</Text>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${Math.max(6, clampValue(value, 0, 1) * 100)}%`, backgroundColor: color }]} />
      </View>
    </Box>
  )
}

function InfoCard({ title, body, items }: { title: string; body: string; items: string[] }) {
  return (
    <Card tone="elevated">
      <Box style={{ gap: 8 }}>
        <Text size="lg" weight="bold">{title}</Text>
        <Text size="sm" tone="muted">{body}</Text>
        {items.map((item, index) => (
          <Text key={`${item}-${index}`} size="sm" tone="muted">{`• ${item}`}</Text>
        ))}
      </Box>
    </Card>
  )
}

function statusGlyph(state: HexagonState | 'noisy' | 'blocked' | 'retry') {
  switch (state) {
    case 'ready':
      return '●'
    case 'listening':
      return '◉'
    case 'noisy':
      return '≈'
    case 'locked':
      return '◆'
    case 'success':
      return '✓'
    case 'needsRetry':
    case 'retry':
      return '↺'
    case 'paused':
    case 'blocked':
      return 'Ⅱ'
    case 'voiceDetected':
      return '◌'
    case 'tracking':
      return '▵'
    case 'unstable':
      return '!'
    default:
      return '○'
  }
}

function clampValue(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function hexagonPath(size: number) {
  const center = size / 2
  const radius = size / 2 - 10
  const points = Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 6
    return [center + radius * Math.cos(angle), center + radius * Math.sin(angle)] as const
  })
  return `M ${points.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(177, 151, 255, 0.16)',
    shadowColor: '#2E1A6C',
    shadowOpacity: 0.3,
    shadowRadius: 44,
    shadowOffset: { width: 0, height: 22 },
  },
  orbLeft: {
    width: 260,
    height: 260,
    left: -80,
    top: -30,
  },
  orbRight: {
    width: 220,
    height: 220,
    right: -60,
    top: 120,
    backgroundColor: 'rgba(104, 201, 255, 0.16)',
  },
  orbBottom: {
    width: 300,
    height: 300,
    bottom: -140,
    left: 40,
    backgroundColor: 'rgba(255, 158, 220, 0.15)',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 8, 20, 0.26)',
  },
  meterTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 999,
  },
})
