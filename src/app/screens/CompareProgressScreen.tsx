import React, { useEffect, useState } from 'react'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Box } from '@/ui'
import { listSessionAggregates } from '@/core/storage/sessionsRepo'
import { getProfile } from '@/core/storage/profileRepo'
import { BrandWorldBackdrop, MilestoneCard, VoiceSnapshotCard } from '@/ui/guidedJourney'

const copy = {
  title: 'Compare progress',
  subtitle: 'Baseline versus latest, trend direction, and the strongest current improvement.',
  loading: 'Loading your comparison…',
  baselineTitle: 'Baseline',
  latestTitle: 'Latest',
  deltaTitle: 'Delta',
  strongestTitle: 'Strongest improvement',
}

export function CompareProgressScreen(): React.ReactElement {
  const [vm, setVm] = useState<{
    baseline: number
    latest: number
    delta: number
    strongest: string
    wobble: number
    bias: number
  } | null>(null)

  useEffect(() => {
    ;(async () => {
      const [sessions, profile] = await Promise.all([listSessionAggregates(180), getProfile()])
      const completed = sessions.filter((row) => row.attemptCount > 0)
      const baseline = Math.round(completed[0]?.avgScore ?? 0)
      const latest = Math.round(completed.at(-1)?.avgScore ?? 0)
      setVm({
        baseline,
        latest,
        delta: latest - baseline,
        strongest: strongestImprovement(profile),
        wobble: Math.round(profile.wobbleCents),
        bias: Math.round(profile.biasCents),
      })
    })().catch(() => setVm(null))
  }, [])

  if (!vm) {
    return (
      <Screen background="hero">
        <BrandWorldBackdrop />
        <Text preset="h1">{copy.title}</Text>
        <Text preset="muted">{copy.loading}</Text>
      </Screen>
    )
  }

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{copy.title}</Text>
        <Text preset="muted">{copy.subtitle}</Text>
      </Box>

      <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <MilestoneCard title={copy.baselineTitle} body="First recent session average." stat={String(vm.baseline)} />
        <MilestoneCard title={copy.latestTitle} body="Latest recent session average." stat={String(vm.latest)} />
        <MilestoneCard title={copy.deltaTitle} body="Latest minus baseline." stat={`${vm.delta >= 0 ? '+' : ''}${vm.delta}`} />
      </Box>

      <VoiceSnapshotCard
        title={copy.strongestTitle}
        body={vm.strongest}
        items={[
          `Stability spread: ${vm.wobble}`,
          `Bias cents: ${vm.bias}`,
          vm.delta >= 0 ? 'The overall trend is moving up.' : 'The latest session dipped a little, so we are using the next lesson to recover cleanly.',
        ]}
      />
    </Screen>
  )
}

function strongestImprovement(profile: { wobbleCents: number; biasCents: number; voicedRatio: number }) {
  if (profile.voicedRatio >= 0.8) return 'Your voiced ratio is strong, which means the note is staying connected more often.'
  if (Math.abs(profile.biasCents) <= 12) return 'Your average pitch bias is close to center, so entry control is improving.'
  if (profile.wobbleCents <= 18) return 'Your stability spread is relatively tight, so holds should keep getting easier.'
  return 'Your biggest current improvement is simply consistency: more reps are making the engine trust what it hears.'
}
