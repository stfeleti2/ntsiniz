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
import { getVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { mapPackLessonToHostDrills, type HostMappedPackDrill } from '@/core/guidedJourney/hostDrillMapper'
import { BrandWorldBackdrop, ChapterHeroCard, CoachInset, DemoLoopCard, PrimaryActionBar, StatusPill, TechniqueVisualCard, VoiceGuideCard } from '@/ui/guidedJourney'

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Session'>,
  NativeStackScreenProps<RootStackParamList>
>

type SessionVm = {
  sessionId: string
  lessonId: string
  stageId: string
  stageTitle: string
  lessonTitle: string
  lessonPurpose: string
  estimatedTime: string
  coachingLine: string
  whyItMatters: string
  successLooksLike: string
  techniqueCue: string
  plan: HostMappedPackDrill[]
  recommended: HostMappedPackDrill | null
}

const copy = {
  fallbackTitle: 'Training session',
  fallbackBody: 'The guided lesson launcher is off, so we are starting from the host drill pack.',
  fallbackStart: 'Start drill',
  title: 'Start your mission',
  subtitle: 'One lesson, one clear purpose, and a real drill plan under it.',
  lessonBlockTitle: 'What this lesson trains',
  planTitle: 'Mission ladder',
  quickPick: 'Quick pick',
  unsupported: 'Pack-backed only',
  supported: 'Live',
  loading: 'Building your lesson…',
  noPlan: 'We could not map this lesson cleanly yet, so we are falling back to the next best live drill.',
  coachModeTitle: 'Coach mode',
  whyTitle: 'Why this matters',
  successTitle: 'What success looks like',
  techniqueTitle: 'Technique help',
  startLesson: 'Start lesson',
  preparingLesson: 'Preparing lesson',
  openChapter: 'Open chapter',
  back: 'Back',
}

export function SessionScreen({ navigation, route }: Props) {
  const [vm, setVm] = useState<SessionVm | null>(null)
  const [fallbackDrillId, setFallbackDrillId] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const hostPack = loadAllBundledPacks()
      const session = await createSession()

      if (!enableGuidedJourneyV3()) {
        const [profile, attempts] = await Promise.all([getProfile(), listRecentAttempts(20)])
        const next = pickNextDrill(hostPack, profile, { lastDrillId: attempts[0]?.drillId, lastScore: attempts[0]?.score })
        createSessionPlan(hostPack.packId ? session.id : session.id, hostPack, next)
        setFallbackDrillId(next)
        setVm({
          sessionId: session.id,
          lessonId: '',
          stageId: '',
          stageTitle: copy.fallbackTitle,
          lessonTitle: hostPack.drills.find((drill) => drill.id === next)?.title ?? next,
          lessonPurpose: copy.fallbackBody,
          estimatedTime: '3 drills',
          coachingLine: 'We are using the host drill picker because the V3 journey flag is disabled.',
          whyItMatters: 'You still get a valid live practice rep with the existing drill runner.',
          successLooksLike: 'Start the drill, finish the rep, then use results to choose the next move.',
          techniqueCue: 'Listen first, sing second, and keep the onset clean.',
          plan: [],
          recommended: null,
        })
        return
      }

      const program = loadGuidedJourneyProgram()
      const progress = await ensureJourneyV3Progress()
      const current = getCurrentJourneyV3(program, progress)
      const lesson = route.params?.lessonId ? program.lessonsById[route.params.lessonId] ?? current.lesson : current.lesson
      const stage = program.stagesById[route.params?.stageId ?? lesson.stageId] ?? program.stagesById[lesson.stageId] ?? current.stage
      const plan = mapPackLessonToHostDrills(lesson.id, progress.routeId)
      const voice = await getVoiceIdentity()
      const recommended = plan[0] ?? null

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
        createSessionPlan(hostPack.packId ? session.id : session.id, hostPack, next)
        setFallbackDrillId(next)
      }

      const firstPackDrill = recommended ? program.drillsById[recommended.packDrillId] : null
      setVm({
        sessionId: session.id,
        lessonId: lesson.id,
        stageId: stage.id,
        stageTitle: stage.title,
        lessonTitle: lesson.title,
        lessonPurpose: lesson.purpose,
        estimatedTime: lesson.estimatedTime,
        coachingLine: coachingModeLine(voice.coachingMode),
        whyItMatters: firstPackDrill?.targetSkill ? `This mission leans on ${humanize(firstPackDrill.targetSkill)} so songs feel easier later.` : stage.learnerProfile,
        successLooksLike: firstPackDrill?.passCriteria || lesson.completionCriteria[0] || 'Finish the short mission and land at least one clear pass.',
        techniqueCue: firstPackDrill?.correctionCues[0] || firstPackDrill?.coachCues[0] || 'Move calmly toward the center instead of forcing the note.',
        plan,
        recommended,
      })
    })().catch(() => setVm(null))
  }, [route.params?.lessonId, route.params?.stageId])

  const planItems = useMemo<Array<HostMappedPackDrill & { active: boolean }>>(() => {
    if (!vm?.sessionId) return []
    const plan = getPlan(vm.sessionId)
    return (vm.plan ?? []).map((item, index) => ({ ...item, active: index === (plan?.index ?? -1) }))
  }, [vm])

  const startGuided = () => {
    if (!vm?.sessionId) return
    if (vm.recommended) {
      navigation.navigate('Drill', {
        sessionId: vm.sessionId,
        drillId: vm.recommended.hostDrillId,
        packDrillId: vm.recommended.packDrillId,
        lessonId: vm.lessonId,
        stageId: vm.stageId,
      })
      return
    }
    if (fallbackDrillId) navigation.navigate('Drill', { sessionId: vm.sessionId, drillId: fallbackDrillId })
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
        stageLabel={vm.stageTitle}
      />

      <VoiceGuideCard title={copy.lessonBlockTitle} body={vm.lessonPurpose} pill={vm.recommended ? humanize(vm.recommended.family) : copy.quickPick} />
      <CoachInset title={copy.coachModeTitle} body={vm.coachingLine} />
      <DemoLoopCard title={copy.whyTitle} body={vm.whyItMatters} />
      <TechniqueVisualCard title={copy.successTitle} body={vm.successLooksLike} />
      <TechniqueVisualCard title={copy.techniqueTitle} body={vm.techniqueCue} />

      <Card tone="elevated">
        <Text preset="h2">{copy.planTitle}</Text>
        <Box style={{ height: 10 }} />
        {planItems.length ? (
          <Box style={{ gap: 10 }}>
            {planItems.map((item) => (
              <Card key={item.packDrillId} tone={item.active ? 'glow' : 'default'}>
                <Box style={{ gap: 8 }}>
                  <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <Text preset="body" style={{ fontWeight: '900', flex: 1 }}>{item.title}</Text>
                    <StatusPill state={item.supported ? 'ready' : 'locked'} label={item.supported ? copy.supported : copy.unsupported} />
                  </Box>
                  <Text preset="muted">{item.instructions}</Text>
                </Box>
              </Card>
            ))}
          </Box>
        ) : (
          <Text preset="muted">{copy.noPlan}</Text>
        )}
      </Card>

      <PrimaryActionBar
        primaryLabel={vm.recommended || fallbackDrillId ? copy.startLesson : copy.preparingLesson}
        onPrimary={startGuided}
        secondaryLabel={copy.openChapter}
        onSecondary={() => (navigation as any).navigate('CurriculumOverview')}
        helperText={vm.recommended ? `First live step: ${vm.recommended.title}` : copy.noPlan}
      />

      <Button text={copy.back} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}

function humanize(value: string) {
  return value.replace(/_/g, ' ')
}

function coachingModeLine(mode: string) {
  if (mode === 'performerCoach') return 'Dense cues, tighter expectations, and less hand-holding.'
  if (mode === 'practised') return 'Shorter prompts with stronger technical nudges.'
  if (mode === 'casual') return 'Light guidance that stays out of the way while you sing.'
  return 'Clear, gentle, beginner-friendly guidance that keeps the moment calm.'
}
