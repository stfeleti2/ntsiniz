import React, { useEffect, useMemo, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Box } from '@/ui'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'

import { listRecentAttempts } from '@/core/storage/attemptsRepo'
import { listSessionAggregates } from '@/core/storage/sessionsRepo'
import { getProfile } from '@/core/storage/profileRepo'
import type { RootStackParamList } from '../navigation/types'
import { t } from '@/app/i18n'

type Props = NativeStackScreenProps<RootStackParamList, 'CompareProgress'>

const COPY = {
  title: 'Compare progress',
  subtitle: 'Baseline vs latest with clear deltas.',
  loading: 'Loading your comparison…',
  baseline: 'Baseline',
  latest: 'Latest',
  delta: 'Delta',
  strongest: 'Strongest improvement',
  share: 'Share',
  continue: 'Continue',
}

const TIMEFRAMES = [
  { id: '14d', label: '14 days', days: 14 },
  { id: '30d', label: '30 days', days: 30 },
  { id: '90d', label: '90 days', days: 90 },
] as const

export function CompareProgressScreen({ navigation }: Props): React.ReactElement {
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]['id']>('30d')
  const [vm, setVm] = useState<{
    baseline: number
    latest: number
    delta: number
    strongest: string
    wobble: number
    bias: number
    transfer?: number | null
    technique?: number | null
    trend: number[]
  } | null>(null)

  const selectedRange = useMemo(() => TIMEFRAMES.find((item) => item.id === timeframe) ?? TIMEFRAMES[1], [timeframe])

  useEffect(() => {
    ;(async () => {
      const now = Date.now()
      const start = now - selectedRange.days * 24 * 60 * 60 * 1000
      const [sessions, profile, attempts] = await Promise.all([listSessionAggregates(260), getProfile(), listRecentAttempts(120)])
      const completed = sessions.filter((row) => row.attemptCount > 0 && row.startedAt >= start)
      const baseline = Math.round(completed[0]?.avgScore ?? 0)
      const latest = Math.round(completed.at(-1)?.avgScore ?? 0)
      const trend = completed.slice(-10).map((row) => Math.round(row.avgScore))
      const guidedAttempts = attempts.filter((attempt) => attempt.createdAt >= start && attempt.metrics?.guidedJourney?.rubricDimensions)
      const latestGuided = guidedAttempts[0]?.metrics?.guidedJourney?.rubricDimensions ?? null
      setVm({
        baseline,
        latest,
        delta: latest - baseline,
        strongest: strongestImprovement(profile),
        wobble: Math.round(profile.wobbleCents),
        bias: Math.round(profile.biasCents),
        transfer: latestGuided?.transfer_application ?? null,
        technique: latestGuided?.technique_accuracy ?? null,
        trend,
      })
    })().catch(() => setVm(null))
  }, [selectedRange.days])

  if (!vm) {
    return (
      <Screen background="hero">
        <Text preset="h1">{COPY.title}</Text>
        <Text preset="muted">{COPY.loading}</Text>
      </Screen>
    )
  }

  return (
    <Screen scroll background="hero">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{COPY.title}</Text>
        <Text preset="muted">{COPY.subtitle}</Text>
      </Box>

      <Card tone="elevated">
        <Box style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {TIMEFRAMES.map((item) => (
            <Button key={item.id} text={item.label} variant={timeframe === item.id ? 'soft' : 'ghost'} onPress={() => setTimeframe(item.id)} />
          ))}
        </Box>
      </Card>

      <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <StatCard title={COPY.baseline} value={String(vm.baseline)} detail="Start score" />
        <StatCard title={COPY.latest} value={String(vm.latest)} detail="Latest score" />
        <StatCard title={COPY.delta} value={`${vm.delta >= 0 ? '+' : ''}${vm.delta}`} detail="Change" />
      </Box>

      <Card tone="glow">
        <Box style={{ gap: 8 }}>
          <Text preset="h3">{COPY.strongest}</Text>
          <Text preset="body">{vm.strongest}</Text>
          <Text preset="muted">{`Stability spread: ${vm.wobble}`}</Text>
          <Text preset="muted">{`Bias cents: ${vm.bias}`}</Text>
          <Text preset="muted">{vm.technique != null ? `Technique accuracy: ${vm.technique}` : 'Technique evidence is still building.'}</Text>
          <Text preset="muted">{vm.transfer != null ? `Transfer application: ${vm.transfer}` : 'Transfer evidence is still building.'}</Text>
        </Box>
      </Card>

      <Card tone="elevated">
        <Box style={{ gap: 8 }}>
          <Text preset="h3">{t('compareProgress.sessionTrend') ?? 'Session trend'}</Text>
          <Box style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
            {vm.trend.length ? (
              vm.trend.map((value, index) => (
                <Box
                  key={`trend-${index}`}
                  style={{
                    flex: 1,
                    minHeight: 20,
                    height: Math.max(20, Math.round((value / 100) * 90)),
                    borderRadius: 8,
                    backgroundColor: index === vm.trend.length - 1 ? 'rgba(160, 136, 255, 0.86)' : 'rgba(111, 141, 255, 0.42)',
                  }}
                />
              ))
            ) : (
              <Text preset="muted">{t('compareProgress.notEnough') ?? 'Not enough sessions in this range yet.'}</Text>
            )}
          </Box>
        </Box>
      </Card>

      <Box style={{ flexDirection: 'row', gap: 8 }}>
        <Button text={COPY.share} variant="ghost" onPress={() => navigation.navigate('WeeklyReport')} />
        <Button text={COPY.continue} onPress={() => navigation.navigate('MainTabs' as any, { screen: 'Session' } as any)} />
      </Box>
    </Screen>
  )
}

function StatCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <Card tone="elevated" style={{ flex: 1, minWidth: 100 }}>
      <Text preset="muted">{title}</Text>
      <Text preset="h2">{value}</Text>
      <Text preset="muted">{detail}</Text>
    </Card>
  )
}

function strongestImprovement(profile: { wobbleCents: number; biasCents: number; voicedRatio: number }) {
  if (profile.voicedRatio >= 0.8) return 'Voiced consistency is strongest right now.'
  if (Math.abs(profile.biasCents) <= 12) return 'Pitch centering is improving.'
  if (profile.wobbleCents <= 18) return 'Stability has improved noticeably.'
  return 'Overall repetition quality is improving.'
}
