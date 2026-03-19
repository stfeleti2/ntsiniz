import React, { useEffect, useState } from 'react'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Box } from '@/ui'
import { getAdaptiveJourneyState } from '@/core/guidedJourney/adaptiveStateRepo'
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
  } | null>(null)

  useEffect(() => {
    ;(async () => {
      const [adaptive, profile] = await Promise.all([getAdaptiveJourneyState(), getProfile()])
      setVm({
        tags: adaptive.voiceProfile.tags,
        bias: profile.biasCents,
        wobble: profile.wobbleCents,
        voiced: profile.voicedRatio,
        confidence: profile.confidence,
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
          `Bias cents: ${Math.round(vm.bias)}`,
          `Stability spread: ${Math.round(vm.wobble)}`,
          `Voiced ratio: ${Math.round(vm.voiced * 100)}%`,
          `Confidence: ${Math.round(vm.confidence * 100)}%`,
        ]}
      />
    </Screen>
  )
}
