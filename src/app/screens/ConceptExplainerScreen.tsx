import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { track } from '@/app/telemetry'
import { BrandWorldBackdrop, CoachInset, DemoLoopCard, NextStepCard, TechniqueVisualCard } from '@/ui/guidedJourney'
import { loadGuidedLessonVm, type GuidedLessonVm } from './guidedLessonVm'

type Props = NativeStackScreenProps<RootStackParamList, 'ConceptExplainer'>

const copy = {
  title: 'Concept explainer',
  subtitle: 'See the idea, hear the cue, then carry it into the live rep.',
  conceptTitle: 'Core concept',
  bodyCueTitle: 'Body cue',
  nextTitle: 'Technique help',
  nextBody: 'Open the body cue and common miss before you start.',
  nextCta: 'Open technique help',
  startLesson: 'Start lesson',
  loading: 'Loading your concept explainer…',
  back: 'Back',
}

export function ConceptExplainerScreen({ navigation, route }: Props) {
  const [vm, setVm] = useState<GuidedLessonVm | null>(null)

  useEffect(() => {
    loadGuidedLessonVm(route.params.lessonId)
      .then((next) => {
        setVm(next)
        track('guided_lesson_opened', { lessonId: next.lessonId, screen: 'concept_explainer' } as any)
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

      <DemoLoopCard title={copy.conceptTitle} body={vm.conceptBody} />
      <TechniqueVisualCard title={copy.bodyCueTitle} body={vm.bodyCue} />
      <CoachInset title={vm.stageTitle} body={vm.referenceCue} />
      <NextStepCard title={copy.nextTitle} body={copy.nextBody} cta={copy.nextCta} onPress={() => navigation.navigate('TechniqueHelp', { lessonId: vm.lessonId })} />

      <Button text={copy.startLesson} onPress={startLesson} />
      <Button text={copy.back} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
