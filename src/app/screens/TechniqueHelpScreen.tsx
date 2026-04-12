import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Box } from '@/ui'
import { Card } from '@/ui/components/kit'
import { track } from '@/app/telemetry'
import { BrandWorldBackdrop, CoachInset, NextStepCard, TechniqueVisualCard, VoiceGuideCard } from '@/ui/guidedJourney'
import { loadGuidedLessonVm, type GuidedLessonVm } from './guidedLessonVm'

type Props = NativeStackScreenProps<RootStackParamList, 'TechniqueHelp'>

const copy = {
  title: 'Technique help',
  subtitle: 'One physical cue, one common miss, and one reset before the live work.',
  bodyCueTitle: 'Body cue',
  resetTitle: 'Reset cue',
  mistakeTitle: 'Common miss',
  safetyTitle: 'Safety',
  whyTitle: 'Why this matters',
  whyBody: 'See the musical payoff before you go live.',
  whyCta: 'Open why this matters',
  startLesson: 'Start lesson',
  loading: 'Loading technique help…',
  back: 'Back',
}

export function TechniqueHelpScreen({ navigation, route }: Props) {
  const [vm, setVm] = useState<GuidedLessonVm | null>(null)

  useEffect(() => {
    loadGuidedLessonVm(route.params.lessonId)
      .then((next) => {
        setVm(next)
        track('guided_lesson_opened', { lessonId: next.lessonId, screen: 'technique_help' } as any)
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

      <TechniqueVisualCard title={copy.bodyCueTitle} body={vm.bodyCue} />
      <CoachInset title={copy.resetTitle} body={vm.techniqueLine} />
      <VoiceGuideCard title={copy.mistakeTitle} body={vm.mistakeLine} pill={vm.routeId} />
      <Card tone="elevated">
        <Text preset="h2">{copy.safetyTitle}</Text>
        <Box style={{ height: 10 }} />
        <Text preset="muted">{vm.safetyLine}</Text>
      </Card>
      <NextStepCard title={copy.whyTitle} body={copy.whyBody} cta={copy.whyCta} onPress={() => navigation.navigate('WhyThisMatters', { lessonId: vm.lessonId })} />

      <Button text={copy.startLesson} onPress={startLesson} />
      <Button text={copy.back} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
