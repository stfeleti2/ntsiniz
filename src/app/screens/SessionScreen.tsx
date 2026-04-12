import React, { useEffect, useMemo, useState } from 'react'
import { CompositeScreenProps } from '@react-navigation/native'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { StyleSheet, useWindowDimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Card } from '@/ui/components/kit'
import { Button } from '@/ui/components/kit'
import { Box } from '@/ui'

import type { MainTabParamList, RootStackParamList } from '../navigation/types'
import { enableGuidedJourneyV3 } from '@/core/config/flags'
import { createSession } from '@/core/storage/sessionsRepo'
import { createSessionPlan, createSessionPlanFromIds, getPlan } from '@/core/profile/sessionPlan'
import { setSessionMeta } from '@/core/profile/sessionMeta'
import { getProfile } from '@/core/storage/profileRepo'
import { listRecentAttempts } from '@/core/storage/attemptsRepo'
import { loadAllBundledPacks } from '@/core/drills/loader'
import { pickNextDrill } from '@/core/profile/nextDrill'
import { ensureJourneyV3Progress, getCurrentJourneyV3 } from '@/core/guidedJourney/progress'
import { loadGuidedJourneyProgram } from '@/core/guidedJourney/loader'
import { mapPackLessonToHostDrills, type HostMappedPackDrill } from '@/core/guidedJourney/hostDrillMapper'
import { BrandWorldBackdrop, StatusPill } from '@/ui/guidedJourney'
import { t } from '@/app/i18n'

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Session'>,
  NativeStackScreenProps<RootStackParamList>
>

type SessionVm = {
  sessionId: string
  stageId: string
  stageTitle: string
  lessonId: string
  lessonTitle: string
  plan: HostMappedPackDrill[]
  fallbackDrillId: string | null
}

const COPY = {
  title: 'Today’s plan',
  subtitle: 'Record → Playback → Save Best → Next',
  loading: 'Building your guided plan…',
  continue: 'Continue',
  start: 'Start session',
  review: 'Lesson intro',
  fallbackTitle: 'Guided plan unavailable',
  fallbackBody: 'We will start from the best next live drill.',
}

const STAGE_TABS = ['Foundation', 'Control', 'Tone & Style', 'Musicality']

export function SessionScreen({ navigation, route }: Props) {
  const [vm, setVm] = useState<SessionVm | null>(null)
  const { width } = useWindowDimensions()
  const isWide = width >= 940

  useEffect(() => {
    ;(async () => {
      const hostPack = loadAllBundledPacks()
      const session = await createSession()

      if (!enableGuidedJourneyV3()) {
        const [profile, attempts] = await Promise.all([getProfile(), listRecentAttempts(20)])
        const next = pickNextDrill(hostPack, profile, { lastDrillId: attempts[0]?.drillId, lastScore: attempts[0]?.score })
        createSessionPlan(session.id, hostPack, next)
        setVm({
          sessionId: session.id,
          stageId: 'S1',
          stageTitle: COPY.fallbackTitle,
          lessonId: '',
          lessonTitle: next,
          plan: [],
          fallbackDrillId: next,
        })
        return
      }

      const program = loadGuidedJourneyProgram()
      const progress = await ensureJourneyV3Progress()
      const current = getCurrentJourneyV3(program, progress)
      const lesson = route.params?.lessonId ? program.lessonsById[route.params.lessonId] ?? current.lesson : current.lesson
      const stage = program.stagesById[route.params?.stageId ?? lesson.stageId] ?? program.stagesById[lesson.stageId] ?? current.stage
      const plan = mapPackLessonToHostDrills(lesson.id, progress.routeId)

      if (plan.length) {
        createSessionPlanFromIds(session.id, plan.map((item) => item.hostDrillId))
        setSessionMeta(session.id, {
          guidedJourney: {
            routeId: progress.routeId ?? 'R4',
            stageId: stage.id,
            lessonId: lesson.id,
            plan,
          },
        })
      } else {
        const [profile, attempts] = await Promise.all([getProfile(), listRecentAttempts(20)])
        const next = pickNextDrill(hostPack, profile, { lastDrillId: attempts[0]?.drillId, lastScore: attempts[0]?.score })
        createSessionPlan(session.id, hostPack, next)
      }

      setVm({
        sessionId: session.id,
        stageId: stage.id,
        stageTitle: stage.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        plan,
        fallbackDrillId: null,
      })
    })().catch(() => setVm(null))
  }, [route.params?.lessonId, route.params?.stageId])

  const activeStageTab = useMemo(() => {
    if (!vm?.stageTitle) return STAGE_TABS[0]
    const lower = vm.stageTitle.toLowerCase()
    if (lower.includes('control')) return STAGE_TABS[1]
    if (lower.includes('tone') || lower.includes('style')) return STAGE_TABS[2]
    if (lower.includes('music')) return STAGE_TABS[3]
    return STAGE_TABS[0]
  }, [vm?.stageTitle])

  const cards = useMemo(() => {
    if (!vm) return [] as Array<{ icon: string; title: string; status: string; difficulty: string; progress: number; drill?: HostMappedPackDrill }>
    const planState = getPlan(vm.sessionId)
    const labels = ['Warmup', 'Match Note', 'Pitch Slides', 'Bonus Drill', 'Upcoming']
    const populated = vm.plan.slice(0, 5)
    return labels.map((label, index) => {
      const drill = populated[index]
      const status = index < (planState?.index ?? 0) ? 'Completed' : index === (planState?.index ?? 0) ? 'Now' : 'New'
      return {
        icon: iconForDrill(drill?.family ?? ''),
        title: drill?.title ?? label,
        status,
        difficulty: drill?.loadTier ?? 'LT1',
        progress: Math.max(0.08, Math.min(1, (index + 1) / Math.max(1, labels.length))),
        drill,
      }
    })
  }, [vm])

  const startNow = () => {
    if (!vm) return
    const next = cards.find((card) => card.status === 'Now' && card.drill)?.drill ?? vm.plan[0]
    if (next) {
      navigation.navigate('Drill', {
        sessionId: vm.sessionId,
        drillId: next.hostDrillId,
        packDrillId: next.packDrillId,
        lessonId: vm.lessonId,
        stageId: vm.stageId,
      })
      return
    }
    if (vm.fallbackDrillId) {
      navigation.navigate('Drill', { sessionId: vm.sessionId, drillId: vm.fallbackDrillId })
    }
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
        <Text preset="h1">{COPY.title}</Text>
        <Text preset="muted">{COPY.subtitle}</Text>
      </Box>

      {!vm.plan.length ? (
        <Card tone="warning">
          <Text preset="h3">{COPY.fallbackTitle}</Text>
          <Text preset="muted">{COPY.fallbackBody}</Text>
        </Card>
      ) : null}

      <Card tone="elevated" style={{ overflow: 'hidden' }}>
        <LinearGradient colors={['rgba(80,48,186,0.36)', 'rgba(17,11,45,0.42)']} style={StyleSheet.absoluteFill} />
        <Box style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {STAGE_TABS.map((tab, tabIndex) => (
            <StatusPill key={`tab-${tabIndex}`} state={tab === activeStageTab ? 'ready' : 'paused'} label={tab} />
          ))}
        </Box>
      </Card>

      <Card tone="glow">
        <Box style={{ gap: 8 }}>
          <Text preset="h3">{vm.lessonTitle}</Text>
          <Text preset="muted">{vm.stageTitle}</Text>
          <Text preset="muted">{t('guidedFlow.sessionNowWhyNext')}</Text>
        </Box>
      </Card>

      <Box style={{ flexDirection: isWide ? 'row' : 'column', flexWrap: isWide ? 'wrap' : 'nowrap', gap: 10 }}>
        {cards.map((card, index) => (
          <Card key={`${card.title}-${index}`} tone={card.status === 'Now' ? 'glow' : 'default'} style={{ width: isWide ? '48%' : '100%' }}>
            <Box style={{ gap: 8 }}>
              <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <Text preset="body">{`${card.icon} ${card.title}`}</Text>
                <StatusPill state={card.status === 'Completed' ? 'success' : card.status === 'Now' ? 'ready' : 'paused'} label={card.status} />
              </Box>
              <Text preset="muted">{`Difficulty: ${card.difficulty}`}</Text>
              <ViewProgress progress={card.progress} />
            </Box>
          </Card>
        ))}
      </Box>

      <Button text={COPY.continue} onPress={startNow} testID="btn-session-start" />
      <Button text={COPY.review} variant="ghost" onPress={() => navigation.navigate('LessonIntro', { lessonId: vm.lessonId })} />
    </Screen>
  )
}

function iconForDrill(family: string) {
  if (family.includes('match')) return '◉'
  if (family.includes('slide')) return '↗'
  if (family.includes('sustain')) return '▬'
  if (family.includes('interval')) return '⇅'
  if (family.includes('melody')) return '♪'
  return '●'
}

function ViewProgress({ progress }: { progress: number }) {
  return (
    <Box
      style={{
        height: 8,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.13)',
        overflow: 'hidden',
      }}
    >
      <Box
        style={{
          height: 8,
          width: `${Math.round(progress * 100)}%`,
          borderRadius: 999,
          backgroundColor: 'rgba(170, 150, 255, 0.86)',
        }}
      />
    </Box>
  )
}
