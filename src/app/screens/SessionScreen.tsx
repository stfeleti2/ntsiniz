import React, { useEffect, useMemo, useState } from "react"
import { CompositeScreenProps } from "@react-navigation/native"
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Screen } from "@/ui/components/Screen"
import { Text } from "@/ui/components/Typography"
import { Button } from "@/ui/components/Button"
import { Card } from "@/ui/components/Card"
import type { MainTabParamList, RootStackParamList } from "../navigation/types"
import { loadAllBundledPacks } from "@/core/drills/loader"
import { pickNextDrill } from "@/core/profile/nextDrill"
import { createSession } from "@/core/storage/sessionsRepo"
import { listRecentAttempts } from "@/core/storage/attemptsRepo"
import { getProfile } from "@/core/storage/profileRepo"
import { createSessionPlan, createSessionPlanFromIds, getPlan } from "@/core/profile/sessionPlan"
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { reportUiError } from '@/app/telemetry/report'
import { SessionSummaryModule, useModuleEnabled } from '@/ui/modules'
import { loadCurriculum } from '@/core/curriculum/loader'
import { getCurriculumState } from '@/core/curriculum/progress'
import { loadPhase1Lessons, loadProRegimenLessons, loadProRegimen12Lessons, findLesson } from '@/core/coaching/lessons'
import { getDailyChallenge } from '@/core/challenges/dailyChallenge'
import { getWeeklyChallengeById } from '@/core/challenges/weeklyChallenges'
import { getIsoWeekKey } from '@/core/time/week'
import { playToneSequence } from '@/app/audio/tonePlayer'
import { parseNoteToMidi } from '@/core/pitch/noteParse'
import { midiToHz } from '@/core/pitch/hzToNote'
import { setSessionMeta } from '@/core/profile/sessionMeta'
import type { FeedbackPlan } from '@/core/coaching/feedbackPolicy'
import * as Speech from 'expo-speech'
import { getLessonVoiceAsset } from '@/app/audio/lessonVoiceAssets'
import { playVoiceDemo, stopVoiceDemo } from '@/app/audio/voiceDemoPlayer'
import { getSettings } from '@/core/storage/settingsRepo'

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Session">,
  NativeStackScreenProps<RootStackParamList>
>

export function SessionScreen({ navigation, route }: Props) {
  const pack = useMemo(() => loadAllBundledPacks(), [])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [activeCurriculum, setActiveCurriculum] = useState<'phase1' | 'pro_regimen' | 'pro_regimen12'>('phase1')
  const [activeTrack, setActiveTrack] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [recommended, setRecommended] = useState<string | null>(null)
  const [lessonTitle, setLessonTitle] = useState<string | null>(null)
  const [lessonBody, setLessonBody] = useState<string | null>(null)
  const [lessonDemo, setLessonDemo] = useState<{ freqHz: number; durationMs: number; gapMs?: number }[] | null>(null)
  const [lessonKeyPoints, setLessonKeyPoints] = useState<string[] | null>(null)
  const [lessonDo, setLessonDo] = useState<string[] | null>(null)
  const [lessonAvoid, setLessonAvoid] = useState<string[] | null>(null)
  const [lessonScript, setLessonScript] = useState<string[] | null>(null)
  const [lessonVoiceAsset, setLessonVoiceAsset] = useState<number | null>(null)
  const [voicePlaying, setVoicePlaying] = useState(false)
  const [headerTitle, setHeaderTitle] = useState<string | null>(null)
  const [headerSubtitle, setHeaderSubtitle] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const settings = await getSettings().catch(() => null)
      setActiveCurriculum((settings?.activeCurriculum ?? 'phase1') as any)
      setActiveTrack((settings?.activeTrack ?? 'beginner') as any)

      const s = await createSession()
      setSessionId(s.id)

      const attempts = await listRecentAttempts(40)
      const profile = await getProfile()
      const last = attempts[0]

      const curriculumDayId = route.params?.curriculumDayId
      const dailyChallenge = !!route.params?.dailyChallenge
      const weeklyChallengeId = route.params?.weeklyChallengeId

      if (curriculumDayId) {
        const curr = loadCurriculum(activeCurriculum as any, activeTrack as any)
        const day = curr.days.find((d) => d.id === curriculumDayId) ?? curr.days[0]
        const idx = curr.days.findIndex((d) => d.id === day?.id)
        const st = await getCurriculumState(curr).catch(() => null as any)
        const maxStartIndex = st ? (st.doneToday ? st.displayIndex : st.dayIndex) : 0
        if (idx > maxStartIndex) {
          // Defensive gate: future days are preview-only.
          ;(navigation as any).getParent?.()?.navigate?.('CurriculumDayPreview', { dayId: day.id })
          return
        }
        setHeaderTitle(day ? `${t('curriculum.today')}: ${day.title}` : t('session.title'))
        setHeaderSubtitle(day?.focus ?? t('session.subtitle'))

        const lessons =
          activeCurriculum === 'pro_regimen12'
            ? loadProRegimen12Lessons(activeTrack)
            : activeCurriculum === 'pro_regimen'
              ? loadProRegimenLessons()
              : loadPhase1Lessons()
        const lesson = findLesson(lessons, day?.lessonId)
        const baseFeedbackPlan: Partial<FeedbackPlan> | null = (lesson as any)?.meta?.feedbackPlan ?? null
        setLessonTitle(lesson?.title ?? null)
        setLessonBody(lesson?.body ?? null)
        setLessonKeyPoints((lesson as any)?.keyPoints ?? null)
        setLessonDo((lesson as any)?.doThis ?? null)
        setLessonAvoid((lesson as any)?.avoidThis ?? null)
        setLessonScript((lesson as any)?.coachScript ?? null)
        setLessonVoiceAsset(getLessonVoiceAsset(lesson?.id ?? null))
        setLessonDemo(
          lesson?.demo
            ? lesson.demo
                .map((x) => {
                  const midi = parseNoteToMidi(x.note)
                  return midi == null ? null : { freqHz: midiToHz(midi), durationMs: x.durationMs, gapMs: x.gapMs }
                })
                .filter(Boolean) as any
            : null,
        )

        const ids = (day?.drillIds ?? []).filter((id: string) => pack.drills.some((d) => d.id === id))
        const fallback = pickNextDrill(pack, profile, { lastDrillId: last?.drillId, lastScore: last?.score })
        const list = ids.length ? ids : [fallback]
        setRecommended(list[0])
        createSessionPlanFromIds(s.id, list)
        setSessionMeta(s.id, {
          curriculumDayId,
          lessonId: day?.lessonId,
          track: (activeTrack as any) ?? 'beginner',
          week: day?.week,
          day: day?.day,
          baseFeedbackPlan: baseFeedbackPlan ?? undefined,
        })
        return
      }

      if (dailyChallenge) {
        const c = getDailyChallenge()
        setHeaderTitle(t('challenge.sessionTitle'))
        setHeaderSubtitle(t('challenge.sessionSubtitle'))
        setLessonTitle(t('challenge.miniCoachTitle'))
        setLessonBody(t('challenge.miniCoachBody'))

        // Plan: challenge + 2 support drills
        const support = pickNextDrill(pack, profile, { lastDrillId: c.drillId, lastScore: 0, focusType: pack.drills.find((d) => d.id === c.drillId)?.type })
        const support2 = pickNextDrill(pack, profile, { lastDrillId: support, lastScore: 0 })
        const list = [c.drillId, support, support2].filter(Boolean)
        setRecommended(c.drillId)
        createSessionPlanFromIds(s.id, list as any)
        setSessionMeta(s.id, { dailyChallenge: true })
        return
      }

      if (weeklyChallengeId) {
        const wk = getWeeklyChallengeById(weeklyChallengeId)
        if (wk) {
          setHeaderTitle(t('challenge.weeklyTitle'))
          setHeaderSubtitle(wk.subtitle)
          setLessonTitle(t('challenge.weeklyCoachTitle'))
          setLessonBody(t('challenge.weeklyCoachBody'))
          const ids = wk.drillIds.filter((id) => pack.drills.some((d) => d.id === id))
          const list = ids.length ? ids : [pickNextDrill(pack, profile, { lastDrillId: last?.drillId, lastScore: last?.score })]
          setRecommended(list[0] ?? null)
          createSessionPlanFromIds(s.id, list as any)
          setSessionMeta(s.id, { weeklyChallengeId, weeklyPeriodKey: getIsoWeekKey() })
          return
        }
      }

      const focusType = route.params?.focusType
      const next = pickNextDrill(pack, profile, { lastDrillId: last?.drillId, lastScore: last?.score, focusType })
      setRecommended(next)
      createSessionPlan(s.id, pack, next)
    })().catch((e) => reportUiError(e, { screen: 'Session' }))
  }, [pack, route.params?.focusType, route.params?.curriculumDayId, route.params?.dailyChallenge, route.params?.weeklyChallengeId])

  useEffect(() => {
    return () => {
      Speech.stop()
      void stopVoiceDemo()
    }
  }, [])

  const recTitle = useMemo(() => {
    if (!recommended) return t('common.ellipsis')
    return pack.drills.find((d) => d.id === recommended)?.title ?? recommended
  }, [pack.drills, recommended])

  const plan = sessionId ? getPlan(sessionId) : null
  const summaryEnabled = useModuleEnabled('module.session.summary')

  const planItems = useMemo(() => {
    if (!plan) return []
    return plan.drillIds.map((id, idx) => {
      const d = pack.drills.find((x) => x.id === id)
      return {
        id,
        label: d?.title ?? id,
        isCurrent: idx === plan.index,
        isDone: idx < plan.index,
      }
    })
  }, [pack.drills, plan])

  return (
    <Screen scroll background="gradient">
      {lessonTitle && lessonBody ? (
        <Card tone="glow">
          <Text preset="h2">{lessonTitle}</Text>
          <Text preset="muted">{lessonBody}</Text>

          {lessonKeyPoints?.length ? (
            <Box style={{ marginTop: 10, gap: 4 }}>
              <Text preset="body" style={{ fontWeight: '900' }}>{t('lesson.keyPointsTitle')}</Text>
              {lessonKeyPoints.slice(0, 6).map((x) => (
                <Text key={x} preset="muted">{`• ${x}`}</Text>
              ))}
            </Box>
          ) : null}

          {lessonDo?.length ? (
            <Box style={{ marginTop: 10, gap: 4 }}>
              <Text preset="body" style={{ fontWeight: '900' }}>{t('lesson.doThisTitle')}</Text>
              {lessonDo.slice(0, 6).map((x) => (
                <Text key={x} preset="muted">{`• ${x}`}</Text>
              ))}
            </Box>
          ) : null}

          {lessonAvoid?.length ? (
            <Box style={{ marginTop: 10, gap: 4 }}>
              <Text preset="body" style={{ fontWeight: '900' }}>{t('lesson.avoidThisTitle')}</Text>
              {lessonAvoid.slice(0, 6).map((x) => (
                <Text key={x} preset="muted">{`• ${x}`}</Text>
              ))}
            </Box>
          ) : null}

          {lessonScript?.length ? (
            <Box style={{ marginTop: 12, gap: 10 }}>
              <Button
                text={voicePlaying ? t('lesson.stopVoice') : t('lesson.playVoiceDemo')}
                variant="soft"
                onPress={() => {
                  if (voicePlaying) {
                    Speech.stop()
                    void stopVoiceDemo()
                    setVoicePlaying(false)
                    return
                  }
                  try {
                    Speech.stop()
                    void stopVoiceDemo()
                    if (lessonVoiceAsset) {
                      void playVoiceDemo(lessonVoiceAsset, { volume: 0.95, onDone: () => setVoicePlaying(false) }).catch(() => {})
                      setVoicePlaying(true)
                      return
                    }
                    Speech.speak(lessonScript.join(' '), {
                      rate: 0.95,
                      pitch: 1.0,
                      onDone: () => setVoicePlaying(false),
                      onStopped: () => setVoicePlaying(false),
                    } as any)
                    setVoicePlaying(true)
                  } catch {
                    // ignore
                  }
                }}
              />
            </Box>
          ) : null}

          {lessonDemo?.length ? (
            <Button
              text={t('lesson.playToneDemo')}
              variant="soft"
              onPress={async () => {
                try {
                  await playToneSequence(lessonDemo, { volume: 0.92 })
                } catch {
                  // ignore
                }
              }}
            />
          ) : null}
        </Card>
      ) : null}

      {summaryEnabled ? (
        <SessionSummaryModule
          testID="session.summary"
          recommendedTitle={recTitle}
          primaryLabel={sessionId && recommended ? t('session.start') : t('session.preparing')}
          primaryDisabled={!sessionId || !recommended}
          onPrimary={() => (navigation as any).navigate('Drill', { sessionId: sessionId!, drillId: recommended! })}
          planItems={planItems.length ? planItems : undefined}
        />
      ) : (
        <>
          <Box style={{ gap: 6 }}>
            <Text preset="h1">{headerTitle ?? t('session.title')}</Text>
            <Text preset="muted">{headerSubtitle ?? t('session.subtitle')}</Text>
          </Box>

          <Card tone="glow">
            <Text preset="h2">{t('session.recommendedTitle')}</Text>
            <Text preset="muted">{t('session.recommendedSubtitle')}</Text>
            <Text preset="body" style={{ fontWeight: "900" }}>
              {recTitle}
            </Text>
            <Button
              text={sessionId && recommended ? t('session.start') : t('session.preparing')}
              disabled={!sessionId || !recommended}
              onPress={() => (navigation as any).navigate('Drill', { sessionId: sessionId!, drillId: recommended! })}
              testID="btn-session-start"
            />

            {plan ? (
              <Box style={{ gap: 8, marginTop: 10 }}>
                <Text preset="muted">{t('session.planTitle')}</Text>
                {plan.drillIds.map((id, idx) => {
                  const d = pack.drills.find((x) => x.id === id)
                  return (
                    <Text key={`${id}-${idx}`} preset="body" style={{ fontWeight: idx === plan.index ? "900" : "700", opacity: idx < plan.index ? 0.7 : 1 }}>
                      {idx + 1}. {d?.title ?? id}
                    </Text>
                  )
                })}
              </Box>
            ) : null}
          </Card>
        </>
      )}

      <Card>
        <Text preset="h2">{t('session.quickPickTitle')}</Text>
        <Text preset="muted">{t('session.quickPickSubtitle')}</Text>
        {pack.drills.map((d) => (
          <Button
            key={d.id}
            text={d.title}
            variant="ghost"
            disabled={!sessionId}
            onPress={() => {
              createSessionPlanFromIds(sessionId!, [d.id])
              ;(navigation as any).navigate('Drill', { sessionId: sessionId!, drillId: d.id })
            }}
          />
        ))}
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
