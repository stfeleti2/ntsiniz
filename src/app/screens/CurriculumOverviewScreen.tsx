import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { enableGuidedJourneyV3 } from '@/core/config/flags'
import { ensureJourneyV3Progress, getCurrentJourneyV3, getLessonsForStage, getStageProgress } from '@/core/guidedJourney/progress'
import { loadGuidedJourneyProgram } from '@/core/guidedJourney/loader'
import { BrandWorldBackdrop, ChapterHeroCard, MilestoneCard, StatusPill } from '@/ui/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, 'CurriculumOverview'>

type OverviewVm = {
  stageId: string
  stageTitle: string
  stageProfile: string
  goals: string[]
  progressLine: string
  currentLessonId: string
  currentLessonTitle: string
  lessons: Array<{ id: string; title: string; purpose: string; locked: boolean; current: boolean }>
}

const copy = {
  fallbackTitle: 'Chapter overview',
  fallbackBody: 'The legacy curriculum overview is hidden while the guided journey is active.',
  title: 'Chapter overview',
  subtitle: 'What this chapter trains, why it matters, and which lesson is next.',
  goalsTitle: 'Why this chapter matters',
  lessonsTitle: 'Lesson list',
  startCurrent: 'Start current mission',
  openLesson: 'Open lesson',
  loading: 'Loading your chapter…',
  locked: 'Locked',
  current: 'Current',
  open: 'Open',
}

export function CurriculumOverviewScreen({ navigation }: Props) {
  const [vm, setVm] = useState<OverviewVm | null>(null)

  useEffect(() => {
    if (!enableGuidedJourneyV3()) {
      setVm(null)
      return
    }

    ;(async () => {
      const program = loadGuidedJourneyProgram()
      const progress = await ensureJourneyV3Progress()
      const current = getCurrentJourneyV3(program, progress)
      const lessons = getLessonsForStage(program, current.stage.id)
      const stageProgress = getStageProgress(program, progress, current.stage.id)
      setVm({
        stageId: current.stage.id,
        stageTitle: current.stage.title,
        stageProfile: current.stage.learnerProfile,
        goals: current.stage.goals,
        progressLine: `${stageProgress.completed}/${stageProgress.total} lessons complete`,
        currentLessonId: current.lesson.id,
        currentLessonTitle: current.lesson.title,
        lessons: lessons.map((lesson, index) => ({
          id: lesson.id,
          title: lesson.title,
          purpose: lesson.purpose,
          locked: !(progress.unlockedLessonIds ?? []).includes(lesson.id) && lesson.id !== current.lesson.id && index > stageProgress.completed,
          current: lesson.id === current.lesson.id,
        })),
      })
    })().catch(() => setVm(null))
  }, [])

  if (!enableGuidedJourneyV3()) {
    return (
      <Screen background="gradient">
        <Text preset="h1">{copy.fallbackTitle}</Text>
        <Text preset="muted">{copy.fallbackBody}</Text>
      </Screen>
    )
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

      <ChapterHeroCard title={vm.currentLessonTitle} subtitle={`${vm.stageProfile} · ${vm.progressLine}`} stageLabel={vm.stageTitle} cta={copy.startCurrent} onPress={() => navigation.navigate('MainTabs' as any, { screen: 'Session', params: { lessonId: vm.currentLessonId, stageId: vm.stageId } } as any)} />

      <Card tone="glow">
        <Text preset="h2">{copy.goalsTitle}</Text>
        <Box style={{ height: 10 }} />
        <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          {vm.goals.map((goal, index) => (
            <MilestoneCard key={`${goal}-${index}`} title={vm.stageTitle} body={goal} stat={String(index + 1)} />
          ))}
        </Box>
      </Card>

      <Card tone="elevated">
        <Text preset="h2">{copy.lessonsTitle}</Text>
        <Box style={{ height: 10 }} />
        <Box style={{ gap: 10 }}>
          {vm.lessons.map((lesson) => (
            <Card key={lesson.id} tone={lesson.current ? 'glow' : 'default'}>
              <Box style={{ gap: 8 }}>
                <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <Text preset="body" style={{ fontWeight: '900', flex: 1 }}>{lesson.title}</Text>
                  <StatusPill state={lesson.locked ? 'blocked' : lesson.current ? 'ready' : 'success'} label={lesson.locked ? copy.locked : lesson.current ? copy.current : copy.open} />
                </Box>
                <Text preset="muted">{lesson.purpose}</Text>
                <Button text={copy.openLesson} variant={lesson.current ? 'primary' : 'soft'} onPress={() => navigation.navigate('CurriculumDayPreview', { dayId: lesson.id })} />
              </Box>
            </Card>
          ))}
        </Box>
      </Card>
    </Screen>
  )
}
