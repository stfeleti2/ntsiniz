import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { track } from '@/app/telemetry'
import { BrandWorldBackdrop, ChapterHeroCard, CoachInset, NextStepCard, VoiceGuideCard } from '@/ui/guidedJourney'
import { loadGuidedLessonVm, type GuidedLessonVm } from './guidedLessonVm'

type Props = NativeStackScreenProps<RootStackParamList, 'LessonIntro'>

const copy = {
  title: 'Lesson intro',
  subtitle: 'One clear reason for this mission, and one calm way into it.',
  whyTitle: 'Why this lesson matters',
  coachTitle: 'Coach cue',
  conceptTitle: 'Concept explainer',
  conceptBody: 'See the core idea before you go live.',
  conceptCta: 'Open concept',
  startLesson: 'Start lesson',
  loading: 'Loading your lesson intro…',
  back: 'Back',
}

export function LessonIntroScreen({ navigation, route }: Props) {
  const [vm, setVm] = useState<GuidedLessonVm | null>(null)

  useEffect(() => {
    loadGuidedLessonVm(route.params.lessonId)
      .then((next) => {
        setVm(next)
        track('guided_lesson_opened', { lessonId: next.lessonId, screen: 'lesson_intro' } as any)
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

      <ChapterHeroCard
        title={vm.lessonTitle}
        subtitle={`${vm.stageTitle} · ${vm.estimatedTime}`}
        stageLabel={vm.routeTitle}
        cta={copy.startLesson}
        onPress={startLesson}
      />

      <VoiceGuideCard title={copy.whyTitle} body={vm.whyThisMatters} pill={vm.stageTitle} />
      <CoachInset title={copy.coachTitle} body={vm.coachingLine} />
      <NextStepCard title={copy.conceptTitle} body={copy.conceptBody} cta={copy.conceptCta} onPress={() => navigation.navigate('ConceptExplainer', { lessonId: vm.lessonId })} />

      <Button text={copy.startLesson} onPress={startLesson} />
      <Button text={copy.back} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
