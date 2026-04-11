import React, { useEffect, useState } from 'react'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Box } from '@/ui'
import { listRecentAttempts } from '@/core/storage/attemptsRepo'
import { getAdaptiveJourneyState } from '@/core/guidedJourney/adaptiveStateRepo'
import { getVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { summarizeGuidedAttemptEvidence } from '@/core/guidedJourney/v6Selectors'
import { getProfile } from '@/core/storage/profileRepo'
import { BrandWorldBackdrop, StartingProfileCard, VoiceSnapshotCard } from '@/ui/guidedJourney'

const copy = {
  title: 'Insights',
  subtitle: 'Basic guidance first, then the deeper profile signals underneath it.',
  loading: 'Loading your insights…',
  basicTitle: 'Basic read',
  advancedTitle: 'Advanced read',
}

export function InsightsScreen(): React.ReactElement {
  const [vm, setVm] = useState<{
    tags: string[]
    bias: number
    wobble: number
    voiced: number
    confidence: number
    loadLine: string
    assessmentFocus: string[]
    strongestLine: string
    weakestLine: string
    blockedLine: string
  } | null>(null)

  useEffect(() => {
    ;(async () => {
      const [adaptive, profile, voice, attempts] = await Promise.all([getAdaptiveJourneyState(), getProfile(), getVoiceIdentity(), listRecentAttempts(40)])
      const evidence = summarizeGuidedAttemptEvidence(attempts)
      setVm({
        tags: adaptive.voiceProfile.tags,
        bias: profile.biasCents,
        wobble: profile.wobbleCents,
        voiced: profile.voicedRatio,
        confidence: profile.confidence,
        loadLine: voice.recommendedLoadTier ? `Recommended load: ${voice.recommendedLoadTier}` : 'Recommended load is still stabilizing from recent reps.',
        assessmentFocus: voice.currentAssessmentFocus ?? [],
        strongestLine: evidence.strongestDimensions[0] ? `${evidence.strongestDimensions[0].label}: ${evidence.strongestDimensions[0].score}` : 'No strong rubric leader yet.',
        weakestLine: evidence.weakestDimensions[0] ? `${evidence.weakestDimensions[0].label}: ${evidence.weakestDimensions[0].score}` : 'No weak rubric dimension is repeating yet.',
        blockedLine: evidence.blockedGates[0] ? `${evidence.blockedGates[0].label} (${evidence.blockedGates[0].count})` : 'No gate is repeating heavily right now.',
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

      <StartingProfileCard
        title={copy.basicTitle}
        body="These are the gentle coaching tags the route is using right now."
        items={vm.tags.length ? vm.tags.map((tag) => tag.replace(/_/g, ' ')) : ['No strong diagnosis tags are active right now.']}
      />

      <VoiceSnapshotCard
        title={copy.advancedTitle}
        body="Low-level profile signals from the live pitch engine."
        items={[
          `Strongest dimension: ${vm.strongestLine}`,
          `Lowest current dimension: ${vm.weakestLine}`,
          `Most repeated gate: ${vm.blockedLine}`,
          `Bias cents: ${Math.round(vm.bias)}`,
          `Stability spread: ${Math.round(vm.wobble)}`,
          `Voiced ratio: ${Math.round(vm.voiced * 100)}%`,
          `Confidence: ${Math.round(vm.confidence * 100)}%`,
          vm.loadLine,
          vm.assessmentFocus[0] ? `Assessment focus: ${vm.assessmentFocus[0]}` : 'Assessment focus will fill in as stage-gate evidence grows.',
        ]}
      />
    </Screen>
  )
}
