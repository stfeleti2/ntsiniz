import React, { useEffect, useMemo, useState } from 'react'
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
import { listSessionAggregates } from '@/core/storage/sessionsRepo'
import { getVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { getAdaptiveJourneyState } from '@/core/guidedJourney/adaptiveStateRepo'
import { ensureJourneyV3Progress, getCurrentJourneyV3, getStageProgress } from '@/core/guidedJourney/progress'
import { loadGuidedJourneyProgram } from '@/core/guidedJourney/loader'
import { BrandWorldBackdrop, ChapterHeroCard, CoachInset, JourneyPath, MilestoneCard, NextStepCard, VoiceSnapshotCard } from '@/ui/guidedJourney'

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>

type HomeVm = {
  routeTitle: string
  stageTitle: string
  stageProfile: string
  lessonTitle: string
  lessonId: string
  stageId: string
  stageProgress: { completed: number; total: number; pct: number }
  stageItems: Array<{ id: string; title: string }>
  lockedStageIds: string[]
  stats: {
    sessionCount: number
    streakDays: number
    latestScore: number
    bestScore: number
  }
  voice: Awaited<ReturnType<typeof getVoiceIdentity>>
  adaptive: Awaited<ReturnType<typeof getAdaptiveJourneyState>>
}

const copy = {
  fallbackTitle: 'Your singing journey',
  fallbackBody: 'The new guided route is turned off, so we are keeping the core training actions available.',
  fallbackStart: 'Start training',
  fallbackJourney: 'Open journey',
  title: 'Today inside your voice',
  subtitle: 'Pick up exactly where your last guided win left off.',
  voiceResumeTitle: 'Voice resume',
  voiceResumeBody: 'Your first-win signals and recent attempts shape what we show next.',
  coachTitle: 'Coach insight',
  pathTitle: 'Journey path',
  progressTitle: 'Progress proof',
  milestonesTitle: 'Milestones',
  milestonesBody: 'Unlocked wins, current streak, and chapter momentum.',
  compareTitle: 'Compare progress',
  compareBody: 'See baseline versus latest and keep the next step grounded.',
  voiceProfileTitle: 'Voice profile',
  voiceProfileBody: 'Comfort zone, strengths, and current focus in one place.',
  karaokeTitle: 'Song mode',
  karaokeBody: 'Use real song-phrase drills when you want a more melodic rep.',
  karaokeCta: 'Open song mode',
  performanceTitle: 'Performance mode',
  performanceBody: 'Record a short clip when your route reaches pressure-ready work.',
  performanceCta: 'Open performance mode',
  latestScore: 'Latest score',
  streakDays: 'Day streak',
  sessions: 'Sessions',
  familyWaiting: 'We are still waiting before showing a soft vocal family.',
  loading: 'Loading your route and current chapter…',
}

export function HomeScreen({ navigation }: Props) {
  const [vm, setVm] = useState<HomeVm | null>(null)

  useEffect(() => {
    if (!enableGuidedJourneyV3()) {
      setVm(null)
      return
    }

    ;(async () => {
      const program = loadGuidedJourneyProgram()
      const progress = await ensureJourneyV3Progress()
      const current = getCurrentJourneyV3(program, progress)
      const stageProgress = getStageProgress(program, progress, current.stage.id)
      const [voice, adaptive, aggregates] = await Promise.all([
        getVoiceIdentity(),
        getAdaptiveJourneyState(),
        listSessionAggregates(180),
      ])

      const routeStageIds = program.routesById[progress.routeId ?? 'R4']?.primaryStageIds ?? program.stages.map((stage) => stage.id)
      const currentStageIndex = routeStageIds.indexOf(current.stage.id)
      const lockedStageIds = program.stages
        .filter((stage) => {
          if ((progress.completedStageIds ?? []).includes(stage.id)) return false
          if (stage.id === current.stage.id) return false
          const routeIndex = routeStageIds.indexOf(stage.id)
          return routeIndex === -1 || routeIndex > currentStageIndex
        })
        .map((stage) => stage.id)

      setVm({
        routeTitle: current.route?.title ?? 'General Progression Route',
        stageTitle: current.stage.title,
        stageProfile: current.stage.learnerProfile,
        lessonTitle: current.lesson.title,
        lessonId: current.lesson.id,
        stageId: current.stage.id,
        stageProgress,
        stageItems: program.stages.map((stage) => ({ id: stage.id, title: stage.title })),
        lockedStageIds,
        stats: {
          sessionCount: aggregates.filter((row) => row.attemptCount > 0).length,
          streakDays: computeStreak(aggregates),
          latestScore: Math.round(aggregates.at(-1)?.avgScore ?? 0),
          bestScore: Math.round(Math.max(0, ...aggregates.map((row) => row.avgScore))),
        },
        voice,
        adaptive,
      })
    })().catch(() => setVm(null))
  }, [])

  const comfortLine = useMemo(() => {
    const zone = vm?.voice.comfortZone
    return zone ? formatPitchBand(zone.lowMidi, zone.highMidi) : 'Still warming up'
  }, [vm])

  const likelyFamilyLine = useMemo(() => {
    if (!vm) return copy.familyWaiting
    if (vm.voice.likelyFamily.confidence >= 0.72 && vm.voice.likelyFamily.label) return vm.voice.likelyFamily.label
    return copy.familyWaiting
  }, [vm])

  const coachLine = useMemo(() => {
    if (!vm) return ''
    if (vm.adaptive.helpMode) return 'The coach is keeping hints a little denser because recent reps asked for more support.'
    if (vm.voice.currentFocus[0]) return vm.voice.currentFocus[0]
    if (vm.adaptive.lastRecommendedFamily) return `Next emphasis: ${humanizeFamily(vm.adaptive.lastRecommendedFamily)}.`
    return 'You are on a balanced route, so we are pushing one clear win at a time.'
  }, [vm])

  if (!enableGuidedJourneyV3()) {
    return (
      <Screen scroll background="gradient">
        <Box style={{ gap: 12 }}>
          <Text preset="h1">{copy.fallbackTitle}</Text>
          <Text preset="muted">{copy.fallbackBody}</Text>
        </Box>
        <Card tone="glow">
          <Button text={copy.fallbackStart} onPress={() => navigation.navigate('Session')} />
          <Box style={{ height: 10 }} />
          <Button text={copy.fallbackJourney} variant="soft" onPress={() => navigation.navigate('Journey')} />
        </Card>
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
        title={vm.lessonTitle}
        subtitle={`${vm.routeTitle} · ${vm.stageProfile}`}
        stageLabel={vm.stageTitle}
        cta="Continue training"
        onPress={() => navigation.navigate('Session', { lessonId: vm.lessonId, stageId: vm.stageId })}
      />

      <VoiceSnapshotCard
        title={copy.voiceResumeTitle}
        body={copy.voiceResumeBody}
        items={[
          `Comfort band: ${comfortLine}`,
          `Likely family: ${likelyFamilyLine}`,
          `Current focus: ${vm.voice.currentFocus[0] ?? 'Clean note matching and steady breath.'}`,
        ]}
      />

      <CoachInset title={copy.coachTitle} body={coachLine} />

      <Card tone="elevated">
        <Text preset="h2">{copy.pathTitle}</Text>
        <Box style={{ height: 10 }} />
        <JourneyPath items={vm.stageItems} activeId={vm.stageId} lockedIds={vm.lockedStageIds} />
      </Card>

      <Card tone="glow">
        <Text preset="h2">{copy.progressTitle}</Text>
        <Box style={{ height: 10 }} />
        <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <MilestoneCard title={copy.sessions} body="Completed guided practice sessions." stat={String(vm.stats.sessionCount)} />
          <MilestoneCard title={copy.streakDays} body="Consecutive days with recorded practice." stat={String(vm.stats.streakDays)} />
          <MilestoneCard title={copy.latestScore} body="Latest session average from real attempt scores." stat={String(vm.stats.latestScore || vm.stats.bestScore)} />
        </Box>
        <Box style={{ height: 10 }} />
        <Text preset="muted">{`${vm.stageProgress.completed}/${vm.stageProgress.total} lessons complete in ${vm.stageTitle}.`}</Text>
      </Card>

      <NextStepCard
        title={copy.milestonesTitle}
        body={copy.milestonesBody}
        cta="Open milestones"
        onPress={() => (navigation as any).navigate('Milestones')}
      />

      <NextStepCard
        title={copy.compareTitle}
        body={copy.compareBody}
        cta="Compare progress"
        onPress={() => (navigation as any).navigate('CompareProgress')}
      />

      <NextStepCard
        title={copy.voiceProfileTitle}
        body={copy.voiceProfileBody}
        cta="Open voice profile"
        onPress={() => (navigation as any).navigate('VoiceProfile')}
      />

      {enableKaraokeV1() ? <NextStepCard title={copy.karaokeTitle} body={copy.karaokeBody} cta={copy.karaokeCta} onPress={() => (navigation as any).navigate('KaraokeMode')} /> : null}
      {enablePerformanceModeV1() && vm.stageId === 'S5' ? <NextStepCard title={copy.performanceTitle} body={copy.performanceBody} cta={copy.performanceCta} onPress={() => (navigation as any).navigate('PerformanceMode')} /> : null}
    </Screen>
  )
}

function computeStreak(rows: Array<{ startedAt: number; attemptCount: number }>) {
  const days = Array.from(
    new Set(
      rows
        .filter((row) => row.attemptCount > 0)
        .map((row) => startOfDay(row.startedAt)),
    ),
  ).sort((a, b) => b - a)

  let streak = 0
  let expected = startOfDay(Date.now())
  for (const day of days) {
    if (day === expected) {
      streak += 1
      expected -= 24 * 60 * 60 * 1000
      continue
    }
    if (day === expected - 24 * 60 * 60 * 1000 && streak === 0) {
      expected = day
      streak += 1
      expected -= 24 * 60 * 60 * 1000
      continue
    }
    break
  }
  return streak
}

function startOfDay(value: number) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

function formatPitchBand(lowMidi: number | null, highMidi: number | null) {
  if (lowMidi == null || highMidi == null) return 'Still warming up'
  return `${lowMidi} to ${highMidi} midi`
}

function humanizeFamily(value: string) {
  return value.replace(/_/g, ' ')
}
