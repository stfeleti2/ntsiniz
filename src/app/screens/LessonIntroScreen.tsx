import React, { useEffect, useState } from 'react'
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { LinearGradient } from 'expo-linear-gradient'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { Card } from '@/ui/components/Card'
import { track } from '@/app/telemetry'
import { loadGuidedLessonVm, type GuidedLessonVm } from './guidedLessonVm'
import { t } from '@/app/i18n'
import { BrandWorldBackdrop } from '@/ui/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, 'LessonIntro'>

const COPY = {
  label: 'Lesson',
  title: 'Technique explainer',
  subtitle: 'See it once, then sing it live.',
  loading: 'Loading lesson explainer…',
  why: 'Why this matters',
  start: 'Start',
  help: 'Help',
  example: 'Hear example',
  close: 'Close',
  back: 'Back',
}

export function LessonIntroScreen({ navigation, route }: Props) {
  const [vm, setVm] = useState<GuidedLessonVm | null>(null)
  const { width } = useWindowDimensions()
  const isWide = width >= 900

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
        <Text preset="h1">{COPY.title}</Text>
        <Text preset="muted">{COPY.loading}</Text>
      </Screen>
    )
  }

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <Box style={{ gap: 6 }}>
        <Text preset="muted">{COPY.label}</Text>
        <Text preset="h1">{vm.lessonTitle}</Text>
        <Text preset="muted">{`${COPY.subtitle} · ${vm.estimatedTime}`}</Text>
      </Box>

      <Card tone="glow" style={{ overflow: 'hidden' }}>
        <LinearGradient colors={['rgba(95,56,220,0.42)', 'rgba(20,12,49,0.86)']} style={StyleSheet.absoluteFill} />
        <Box style={{ gap: 10, flexDirection: isWide ? 'row' : 'column' }}>
          <ExplainerVisual
            title={vm.stageTitle}
            bodyCue={vm.bodyCue}
            referenceCue={vm.referenceCue}
            safetyLine={vm.safetyLine}
          />
          <Box style={{ flex: 1, gap: 10 }}>
            <Text preset="h3">{COPY.why}</Text>
            <Text preset="muted">{vm.whyThisMatters}</Text>
            <Text preset="muted">{vm.coachingLine}</Text>
            <Text preset="muted">{t('guidedFlow.lessonIntroNext')}</Text>
          </Box>
        </Box>
      </Card>

      <Card tone="elevated">
        <Box style={{ gap: 8 }}>
          <Text preset="h3">{t('lessonIntro.techniqueCues') ?? 'Technique cues'}</Text>
          <Text preset="muted">{vm.bodyCue}</Text>
          <Text preset="muted">{vm.referenceCue}</Text>
          <Text preset="muted">{vm.safetyLine}</Text>
        </Box>
      </Card>

      <Card tone="elevated">
        <Box style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Button text={COPY.start} onPress={startLesson} />
          <Button text={COPY.help} variant="ghost" onPress={() => navigation.navigate('TechniqueHelp', { lessonId: vm.lessonId })} />
          <Button text={COPY.example} variant="ghost" onPress={() => navigation.navigate('ConceptExplainer', { lessonId: vm.lessonId })} />
          <Button text={COPY.close} variant="ghost" onPress={() => navigation.goBack()} />
        </Box>
      </Card>

      <Button text={COPY.back} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}

function ExplainerVisual({
  title,
  bodyCue,
  referenceCue,
  safetyLine,
}: {
  title: string
  bodyCue: string
  referenceCue: string
  safetyLine: string
}) {
  return (
    <View
      style={{
        minHeight: 220,
        flex: 1,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        backgroundColor: 'rgba(18, 18, 34, 0.72)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 16,
      }}
    >
      <View style={{ width: '100%', gap: 8 }}>
        <View
          style={{
            height: 8,
            borderRadius: 999,
            backgroundColor: 'rgba(140, 122, 255, 0.52)',
          }}
        />
        <View
          style={{
            height: 8,
            borderRadius: 999,
            width: '82%',
            backgroundColor: 'rgba(109, 201, 255, 0.44)',
          }}
        />
        <View
          style={{
            height: 8,
            borderRadius: 999,
            width: '68%',
            backgroundColor: 'rgba(149, 255, 214, 0.4)',
          }}
        />
      </View>
      <Text preset="h3">{title}</Text>
      <Text preset="muted">{bodyCue}</Text>
      <Text preset="muted">{referenceCue}</Text>
      <Text preset="muted">{safetyLine}</Text>
    </View>
  )
}
