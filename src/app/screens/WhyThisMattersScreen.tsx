import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { track } from '@/app/telemetry'
import { BrandWorldBackdrop, ChapterHeroCard, NextStepCard, VoiceGuideCard } from '@/ui/guidedJourney'
import { loadGuidedLessonVm, type GuidedLessonVm } from './guidedLessonVm'

type Props = NativeStackScreenProps<RootStackParamList, 'WhyThisMatters'>

const copy = {
  title: 'Why this matters',
  subtitle: 'Turn the drill into a musical reason the singer can actually care about.',
  payoffTitle: 'Musical payoff',
  routeTitle: 'Why this drill exists in your route',
  prepTitle: 'Drill prep',
  prepBody: 'See what success looks like before you start the live rep.',
  prepCta: 'Open drill prep',
  startLesson: 'Start lesson',
  loading: 'Loading why this matters…',
  back: 'Back',
}

export function WhyThisMattersScreen({ navigation, route }: Props) {
  const [vm, setVm] = useState<GuidedLessonVm | null>(null)

  useEffect(() => {
    loadGuidedLessonVm(route.params.lessonId)
      .then((next) => {
        setVm(next)
        track('guided_lesson_opened', { lessonId: next.lessonId, screen: 'why_this_matters' } as any)
      })
      .catch(() => setVm(null))
  }, [route.params.lessonId])

  const startLesson = () => {
    if (!vm) return
    navigation.navigate('MainTabs' as any, { screen: 'Session', params: { lessonId: vm.lessonId, stageId: vm.stageId } } as any)
  }

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

      <ChapterHeroCard title={vm.lessonTitle} subtitle={vm.stageProfile} stageLabel={vm.stageTitle} />
      <VoiceGuideCard title={copy.payoffTitle} body={vm.musicalPayoff} pill={vm.routeTitle} />
      <VoiceGuideCard title={copy.routeTitle} body={vm.whyThisMatters} />
      <NextStepCard title={copy.prepTitle} body={copy.prepBody} cta={copy.prepCta} onPress={() => navigation.navigate('DrillPrep', { lessonId: vm.lessonId, stageId: vm.stageId })} />

      <Button text={copy.startLesson} onPress={startLesson} />
      <Button text={copy.back} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
