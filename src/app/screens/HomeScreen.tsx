import React, { useEffect, useMemo, useState } from 'react'
import { CompositeScreenProps } from '@react-navigation/native'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { StyleSheet, useWindowDimensions } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'

import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Card } from '@/ui/components/kit'
import { Button } from '@/ui/components/kit'
import { NextActionBar } from '@/ui/components/NextActionBar'
import { Box } from '@/ui'

import type { MainTabParamList, RootStackParamList } from '../navigation/types'
import { enableGuidedJourneyV3 } from '@/core/config/flags'
import { listSessionAggregates } from '@/core/storage/sessionsRepo'
import { getVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { getAdaptiveJourneyState } from '@/core/guidedJourney/adaptiveStateRepo'
import { ensureJourneyV3Progress, getCurrentJourneyV3, getStageProgress } from '@/core/guidedJourney/progress'
import { loadGuidedJourneyProgram } from '@/core/guidedJourney/loader'
import { mapPackLessonToHostDrills } from '@/core/guidedJourney/hostDrillMapper'
import { StatusPill } from '@/ui/guidedJourney'
import { BrandWorldBackdrop } from '@/ui/guidedJourney'
import { RewardedBoostCard } from '@/ui/monetization/RewardedBoostCard'
import { t } from '@/app/i18n'

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>

type HomeVm = {
  stageTitle: string
  lessonTitle: string
  lessonId: string
  stageId: string
  routeTitle: string
  comfortLabel: string
  familyLabel: string
  focusLine: string
  drillPacks: Array<{ id: string; title: string; status: string; difficulty: string }>
  progressLine: string
  stats: {
    sessionCount: number
    streakDays: number
    latestScore: number
  }
}

const COPY = {
  title: 'Welcome back',
  subtitle: 'Your journey is ready. Keep the loop tight.',
  voiceCard: 'Voice profile',
  sessionCard: 'Today’s Session',
  packsTitle: 'Drill Packs',
  progressTitle: 'Progress',
  startNow: 'Start now',
  openSettings: 'Settings',
  fallbackTitle: 'Guided journey is unavailable right now.',
  fallbackBody: 'You can still continue training from the session tab.',
  nextTitle: 'What is next',
  nextSubtitle: 'Continue your guided route',
  viewProgress: 'View progress',
}

export function HomeScreen({ navigation }: Props) {
  const [vm, setVm] = useState<HomeVm | null>(null)
  const { width } = useWindowDimensions()
  const isWide = width >= 960

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
        listSessionAggregates(120),
      ])

      const comfort =
        voice.comfortZone.lowMidi != null && voice.comfortZone.highMidi != null
          ? `${voice.comfortZone.lowMidi}–${voice.comfortZone.highMidi} midi`
          : 'Warming up'
      const family =
        voice.likelyFamily.label && voice.likelyFamily.confidence >= 0.66
          ? `Closest to ${voice.likelyFamily.label}`
          : 'Closest range is still refining'
      const packs = mapPackLessonToHostDrills(current.lesson.id, progress.routeId).slice(0, 5)

      setVm({
        stageTitle: current.stage.title,
        lessonTitle: current.lesson.title,
        lessonId: current.lesson.id,
        stageId: current.stage.id,
        routeTitle: current.route?.title ?? 'Guided route',
        comfortLabel: comfort,
        familyLabel: family,
        focusLine: adaptive.lastRecommendedFamily
          ? `Focus: ${String(adaptive.lastRecommendedFamily).replace(/_/g, ' ')}`
          : voice.currentFocus[0] ?? 'Focus: clean entry and stable holds',
        drillPacks: packs.map((item, index) => ({
          id: item.packDrillId,
          title: item.title,
          status: index === 0 ? 'Now' : index < stageProgress.completed ? 'Completed' : 'New',
          difficulty: item.loadTier ?? 'LT1',
        })),
        progressLine: `${stageProgress.completed}/${stageProgress.total} lessons completed in ${current.stage.title}`,
        stats: {
          sessionCount: aggregates.filter((entry) => entry.attemptCount > 0).length,
          streakDays: computeStreak(aggregates),
          latestScore: Math.round(aggregates.at(-1)?.avgScore ?? 0),
        },
      })
    })().catch(() => setVm(null))
  }, [])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  if (!enableGuidedJourneyV3()) {
    return (
      <Screen scroll background="gradient">
        <Text preset="h1">{COPY.fallbackTitle}</Text>
        <Text preset="muted">{COPY.fallbackBody}</Text>
        <Button text={COPY.startNow} onPress={() => navigation.navigate('Session')} />
      </Screen>
    )
  }

  if (!vm) {
    return (
      <Screen background="hero">
        <Text preset="h1">{COPY.title}</Text>
        <Text preset="muted">{COPY.subtitle}</Text>
      </Screen>
    )
  }

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <LinearGradient colors={['rgba(26,15,66,0.58)', 'rgba(7,7,18,0.2)', 'rgba(43,22,97,0.45)']} style={StyleSheet.absoluteFill} />
      <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box style={{ gap: 4 }}>
          <Text preset="muted">{greeting}</Text>
          <Text preset="h1">{COPY.title}</Text>
        </Box>
        <Button text={COPY.openSettings} variant="ghost" onPress={() => navigation.navigate('Settings')} />
      </Box>

      <Box style={{ flexDirection: isWide ? 'row' : 'column', gap: 12 }}>
        <BlurView intensity={42} tint="dark" style={{ flex: 1, borderRadius: 18, overflow: 'hidden' }}>
          <Card tone="elevated" style={{ flex: 1, backgroundColor: 'rgba(22,14,49,0.72)', borderColor: 'rgba(174,157,255,0.28)' }}>
            <Box style={{ gap: 8 }}>
              <Text preset="h3">{COPY.voiceCard}</Text>
              <StatusPill state="tracking" label={vm.familyLabel} />
              <Text preset="muted">{`Comfort zone: ${vm.comfortLabel}`}</Text>
              <Text preset="muted">{vm.focusLine}</Text>
            </Box>
          </Card>
        </BlurView>

        <Card tone="glow" style={{ flex: 1, overflow: 'hidden' }}>
          <LinearGradient colors={['rgba(121,82,255,0.46)', 'rgba(40,20,95,0.78)']} style={StyleSheet.absoluteFill} />
          <Box style={{ gap: 8 }}>
            <Text preset="h3">{COPY.sessionCard}</Text>
            <Text preset="body">{vm.lessonTitle}</Text>
            <Text preset="muted">{`${vm.stageTitle} · ${vm.routeTitle}`}</Text>
            <Button
              text={COPY.startNow}
              onPress={() => navigation.navigate('Session', { lessonId: vm.lessonId, stageId: vm.stageId })}
            />
            <Text preset="muted">{t('guidedFlow.homeNowWhyNext')}</Text>
          </Box>
        </Card>
      </Box>

      <Box style={{ flexDirection: isWide ? 'row' : 'column', gap: 12 }}>
        <Card tone="elevated" style={{ flex: 1, backgroundColor: 'rgba(15,11,36,0.72)' }}>
          <Box style={{ gap: 10 }}>
            <Text preset="h3">{COPY.packsTitle}</Text>
            {vm.drillPacks.map((pack) => (
              <Card key={pack.id} tone="default" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <Box style={{ flex: 1, gap: 4 }}>
                    <Text preset="body">{pack.title}</Text>
                    <Text preset="muted">{`Difficulty ${pack.difficulty}`}</Text>
                  </Box>
                  <StatusPill state={pack.status === 'Completed' ? 'success' : pack.status === 'Now' ? 'ready' : 'paused'} label={pack.status} />
                </Box>
              </Card>
            ))}
          </Box>
        </Card>

        <Card tone="glow" style={{ flex: 1 }}>
          <Box style={{ gap: 8 }}>
            <Text preset="h3">{COPY.progressTitle}</Text>
            <Text preset="muted">{vm.progressLine}</Text>
            <Text preset="muted">{`Sessions: ${vm.stats.sessionCount}`}</Text>
            <Text preset="muted">{`Streak: ${vm.stats.streakDays} days`}</Text>
            <Text preset="muted">{`Latest score: ${vm.stats.latestScore}`}</Text>
          </Box>
        </Card>
      </Box>

      <RewardedBoostCard surface="Home" />

      <NextActionBar
        title={COPY.nextTitle}
        subtitle={COPY.nextSubtitle}
        primaryLabel={COPY.startNow}
        onPrimary={() => navigation.navigate('Session', { lessonId: vm.lessonId, stageId: vm.stageId })}
        secondaryLabel={COPY.viewProgress}
        onSecondary={() => navigation.navigate('CompareProgress')}
      />
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
