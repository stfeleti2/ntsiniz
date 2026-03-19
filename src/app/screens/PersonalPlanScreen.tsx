import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Box } from '@/ui'
import { getAdaptiveJourneyState } from '@/core/guidedJourney/adaptiveStateRepo'
import { ensureJourneyV3Progress, getCurrentJourneyV3 } from '@/core/guidedJourney/progress'
import { loadGuidedJourneyProgram } from '@/core/guidedJourney/loader'
import { getVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { BrandWorldBackdrop, ChapterHeroCard, NextStepCard, StartingProfileCard, VoiceSnapshotCard } from '@/ui/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalPlan'>

const copy = {
  title: 'Personal plan',
  subtitle: 'Your route, current chapter, next family bias, and live action in one place.',
  loading: 'Loading your plan…',
  adaptiveSupportTitle: 'Adaptive support',
  currentFocusTitle: 'Current focus',
  insightsTitle: 'Insights',
  insightsBody: 'See the tags and profile signals shaping the route.',
  insightsCta: 'Open insights',
}

export function PersonalPlanScreen({ navigation }: Props) {
  const [vm, setVm] = useState<{
    stageTitle: string
    lessonTitle: string
    routeId: string
    helpMode: boolean
    nextFamily: string
    focus: string[]
  } | null>(null)

  useEffect(() => {
    ;(async () => {
      const program = loadGuidedJourneyProgram()
      const progress = await ensureJourneyV3Progress()
      const current = getCurrentJourneyV3(program, progress)
      const [adaptive, voice] = await Promise.all([getAdaptiveJourneyState(), getVoiceIdentity()])
      setVm({
        stageTitle: current.stage.title,
        lessonTitle: current.lesson.title,
        routeId: progress.routeId ?? 'R4',
        helpMode: adaptive.helpMode,
        nextFamily: adaptive.lastRecommendedFamily ? adaptive.lastRecommendedFamily.replace(/_/g, ' ') : 'match note',
        focus: voice.currentFocus,
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

      <ChapterHeroCard title={vm.lessonTitle} subtitle={`Route ${vm.routeId} · next family bias: ${vm.nextFamily}`} stageLabel={vm.stageTitle} cta="Continue training" onPress={() => navigation.navigate('MainTabs' as any, { screen: 'Session' } as any)} />

      <StartingProfileCard
        title={copy.adaptiveSupportTitle}
        body={vm.helpMode ? 'Hints are a little denser right now because the last few attempts asked for more support.' : 'Hints are light because recent attempts looked stable enough to trust.'}
        items={[
          `Route bias: ${vm.routeId}`,
          `Next family: ${vm.nextFamily}`,
          vm.helpMode ? 'Help mode is currently on.' : 'Help mode is currently off.',
        ]}
      />

      <VoiceSnapshotCard title={copy.currentFocusTitle} body="The next few sessions keep these goals in front." items={vm.focus.length ? vm.focus : ['Keep the reps calm and centered.']} />

      <NextStepCard title={copy.insightsTitle} body={copy.insightsBody} cta={copy.insightsCta} onPress={() => navigation.navigate('Insights')} />
    </Screen>
  )
}
