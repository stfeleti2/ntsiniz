import React, { useEffect, useState } from 'react'
import { CompositeScreenProps } from '@react-navigation/native'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import type { MainTabParamList, RootStackParamList } from '../navigation/types'
import { enableGuidedJourneyV3, enableKaraokeV1, enablePerformanceModeV1 } from '@/core/config/flags'
import { ensureJourneyV3Progress, getCurrentJourneyV3, getStageProgress } from '@/core/guidedJourney/progress'
import { loadGuidedJourneyProgram } from '@/core/guidedJourney/loader'
import { BrandWorldBackdrop, ChapterHeroCard, JourneyPath, MilestoneCard, NextStepCard } from '@/ui/guidedJourney'

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Journey'>,
  NativeStackScreenProps<RootStackParamList>
>

type JourneyVm = {
  currentStageId: string
  currentStageTitle: string
  currentLessonTitle: string
  stageProfile: string
  progressLine: string
  stageItems: Array<{ id: string; title: string }>
  lockedIds: string[]
  stageCards: Array<{ id: string; title: string; body: string; stat: string }>
}

const copy = {
  fallbackTitle: 'Journey',
  fallbackBody: 'The pack-backed journey is off, so only the basic training route is available.',
  title: 'Journey map',
  subtitle: 'Five chapters, one route-aware path, and a clear next step at every node.',
  chapterTitle: 'Current chapter',
  milestonesTitle: 'Milestones',
  milestonesBody: 'See unlocked wins and current momentum.',
  compareTitle: 'Compare progress',
  compareBody: 'Compare your baseline against your latest guided work.',
  openMilestones: 'Open milestones',
  openCompare: 'Compare progress',
  openChapter: 'Open chapter overview',
  openCurrentLesson: 'Start current lesson',
  karaokeTitle: 'Song mode',
  karaokeBody: 'Drop into phrase-first practice when you want a more musical session.',
  karaokeCta: 'Open song mode',
  performanceTitle: 'Performance mode',
  performanceBody: 'Use performance capture when you are inside the final chapter.',
  performanceCta: 'Open performance mode',
  loading: 'Loading your stage map…',
}

export function JourneyScreen({ navigation }: Props) {
  const [vm, setVm] = useState<JourneyVm | null>(null)

  useEffect(() => {
    if (!enableGuidedJourneyV3()) {
      setVm(null)
      return
    }

    ;(async () => {
      const program = loadGuidedJourneyProgram()
      const progress = await ensureJourneyV3Progress()
      const current = getCurrentJourneyV3(program, progress)
      const routeStageIds = program.routesById[progress.routeId ?? 'R4']?.primaryStageIds ?? program.stages.map((stage) => stage.id)
      const currentStageIndex = routeStageIds.indexOf(current.stage.id)
      const lockedIds = program.stages
        .filter((stage) => {
          if (stage.id === current.stage.id) return false
          if ((progress.completedStageIds ?? []).includes(stage.id)) return false
          const routeIndex = routeStageIds.indexOf(stage.id)
          return routeIndex === -1 || routeIndex > currentStageIndex
        })
        .map((stage) => stage.id)

      setVm({
        currentStageId: current.stage.id,
        currentStageTitle: current.stage.title,
        currentLessonTitle: current.lesson.title,
        stageProfile: current.stage.learnerProfile,
        progressLine: `${getStageProgress(program, progress, current.stage.id).completed}/${getStageProgress(program, progress, current.stage.id).total} lessons complete in ${current.stage.title}.`,
        stageItems: program.stages.map((stage) => ({ id: stage.id, title: stage.title })),
        lockedIds,
        stageCards: program.stages.map((stage) => {
          const stageProgress = getStageProgress(program, progress, stage.id)
          return {
            id: stage.id,
            title: stage.title,
            body: stage.learnerProfile,
            stat: `${stageProgress.completed}/${stageProgress.total}`,
          }
        }),
      })
    })().catch(() => setVm(null))
  }, [])

  if (!enableGuidedJourneyV3()) {
    return (
      <Screen scroll background="gradient">
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

      <ChapterHeroCard
        title={vm.currentLessonTitle}
        subtitle={vm.stageProfile}
        stageLabel={vm.currentStageTitle}
        cta={copy.openCurrentLesson}
        onPress={() => navigation.navigate('Session')}
      />

      <Card tone="glow">
        <Text preset="h2">{copy.chapterTitle}</Text>
        <Box style={{ height: 10 }} />
        <JourneyPath items={vm.stageItems} activeId={vm.currentStageId} lockedIds={vm.lockedIds} />
        <Box style={{ height: 10 }} />
        <Text preset="muted">{vm.progressLine}</Text>
        <Box style={{ height: 10 }} />
        <Button text={copy.openChapter} onPress={() => (navigation as any).navigate('CurriculumOverview')} />
      </Card>

      <Card tone="elevated">
        <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          {vm.stageCards.map((card) => (
            <MilestoneCard key={card.id} title={card.title} body={card.body} stat={card.stat} />
          ))}
        </Box>
      </Card>

      <NextStepCard title={copy.milestonesTitle} body={copy.milestonesBody} cta={copy.openMilestones} onPress={() => (navigation as any).navigate('Milestones')} />
      <NextStepCard title={copy.compareTitle} body={copy.compareBody} cta={copy.openCompare} onPress={() => (navigation as any).navigate('CompareProgress')} />
      {enableKaraokeV1() ? <NextStepCard title={copy.karaokeTitle} body={copy.karaokeBody} cta={copy.karaokeCta} onPress={() => (navigation as any).navigate('KaraokeMode')} /> : null}
      {enablePerformanceModeV1() && vm.currentStageId === 'S5' ? <NextStepCard title={copy.performanceTitle} body={copy.performanceBody} cta={copy.performanceCta} onPress={() => (navigation as any).navigate('PerformanceMode')} /> : null}
    </Screen>
  )
}
