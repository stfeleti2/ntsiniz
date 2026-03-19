import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { Box } from '@/ui'
import { track } from '@/app/telemetry'
import { AdaptiveInstructionBlock, BrandWorldBackdrop, CoachInset, StatusPill, TechniqueVisualCard, VoiceGuideCard } from '@/ui/guidedJourney'
import { loadGuidedLessonVm, type GuidedLessonVm } from './guidedLessonVm'

type Props = NativeStackScreenProps<RootStackParamList, 'DrillPrep'>

const copy = {
  title: 'Drill prep',
  subtitle: 'Know what to do, what a win looks like, and what cue to trust when the rep goes live.',
  successTitle: 'What success looks like',
  referenceTitle: 'Reference cue',
  planTitle: 'Mission ladder',
  live: 'Live',
  queued: 'Queued',
  startLesson: 'Start lesson',
  lessonIntro: 'Lesson intro',
  loading: 'Loading drill prep…',
}

export function DrillPrepScreen({ navigation, route }: Props) {
  const [vm, setVm] = useState<GuidedLessonVm | null>(null)

  useEffect(() => {
    loadGuidedLessonVm(route.params.lessonId)
      .then((next) => {
        setVm(next)
        track('guided_lesson_opened', { lessonId: next.lessonId, screen: 'drill_prep' } as any)
      })
      .catch(() => setVm(null))
  }, [route.params.lessonId])

  const startLesson = () => {
    if (!vm) return
    navigation.navigate('MainTabs' as any, { screen: 'Session', params: { lessonId: vm.lessonId, stageId: route.params.stageId ?? vm.stageId } } as any)
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

      <AdaptiveInstructionBlock title={vm.lessonTitle} body={vm.purpose} />
      <TechniqueVisualCard title={copy.successTitle} body={vm.successLine} />
      <CoachInset title={copy.referenceTitle} body={vm.referenceCue} />
      <VoiceGuideCard title={vm.stageTitle} body={vm.techniqueLine} pill={vm.routeId} />

      <Card tone="elevated">
        <Text preset="h2">{copy.planTitle}</Text>
        <Box style={{ height: 10 }} />
        <Box style={{ gap: 10 }}>
          {vm.plan.map((item, index) => (
            <Card key={item.packDrillId} tone={index === 0 ? 'glow' : 'default'}>
              <Box style={{ gap: 8 }}>
                <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <Text preset="body" style={{ fontWeight: '900', flex: 1 }}>{item.title}</Text>
                  <StatusPill state={index === 0 ? 'ready' : 'paused'} label={index === 0 ? copy.live : copy.queued} />
                </Box>
                <Text preset="muted">{item.instructions}</Text>
              </Box>
            </Card>
          ))}
        </Box>
      </Card>

      <Button text={copy.startLesson} onPress={startLesson} />
      <Button text={copy.lessonIntro} variant="ghost" onPress={() => navigation.navigate('LessonIntro', { lessonId: vm.lessonId })} />
    </Screen>
  )
}
