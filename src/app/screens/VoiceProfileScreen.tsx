import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { getVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { ensureJourneyV3Progress, getCurrentJourneyV3 } from '@/core/guidedJourney/progress'
import { loadGuidedJourneyProgram } from '@/core/guidedJourney/loader'
import { BrandWorldBackdrop, ChapterHeroCard, NextStepCard, StartingProfileCard, VoiceSnapshotCard } from '@/ui/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, 'VoiceProfile'>

const copy = {
  title: 'Voice profile',
  subtitle: 'A soft snapshot of where your voice feels strongest right now.',
  profileTitle: 'Strengths',
  profileBody: 'These come from your first win and recent route-aware reps.',
  focusTitle: 'Current focus',
  focusBody: 'This is the main training thread we are pushing next.',
  rangeTitle: 'Range snapshot',
  rangeBody: 'See your soft bounds and comfort zone.',
  familyTitle: 'Vocal family',
  familyBody: 'Only shown when confidence is strong enough.',
  planTitle: 'Personal plan',
  planBody: 'Route, stage, lesson, and next live action in one place.',
  loading: 'Loading your voice profile…',
  insights: 'Open insights',
}

export function VoiceProfileScreen({ navigation }: Props) {
  const [vm, setVm] = useState<{
    stageTitle: string
    lessonTitle: string
    voice: Awaited<ReturnType<typeof getVoiceIdentity>>
  } | null>(null)

  useEffect(() => {
    ;(async () => {
      const program = loadGuidedJourneyProgram()
      const progress = await ensureJourneyV3Progress()
      const current = getCurrentJourneyV3(program, progress)
      const voice = await getVoiceIdentity()
      setVm({ stageTitle: current.stage.title, lessonTitle: current.lesson.title, voice })
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

      <ChapterHeroCard title={vm.lessonTitle} subtitle={vm.voice.currentFocus[0] ?? 'Your next lesson is already lined up.'} stageLabel={vm.stageTitle} />

      <StartingProfileCard title={copy.profileTitle} body={copy.profileBody} items={vm.voice.strengths.length ? vm.voice.strengths : ['You gave the app a real first-win signal.']} />
      <VoiceSnapshotCard title={copy.focusTitle} body={copy.focusBody} items={vm.voice.currentFocus.length ? vm.voice.currentFocus : ['We are keeping the next reps calm and clear.']} />

      <NextStepCard title={copy.rangeTitle} body={copy.rangeBody} cta="Open range snapshot" onPress={() => navigation.navigate('RangeSnapshot')} />
      <NextStepCard title={copy.familyTitle} body={copy.familyBody} cta="Open vocal family" onPress={() => navigation.navigate('VocalFamily')} />
      <NextStepCard title={copy.planTitle} body={copy.planBody} cta="Open personal plan" onPress={() => navigation.navigate('PersonalPlan')} />

      <Button text={copy.insights} variant="ghost" onPress={() => navigation.navigate('Insights')} />
    </Screen>
  )
}
