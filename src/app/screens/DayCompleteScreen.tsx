import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Animated } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Card } from '@/ui/components/kit'
import { Button } from '@/ui/components/kit'
import { CelebrationOverlay } from '@/ui/components/CelebrationOverlay'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { loadCurriculum } from '@/core/curriculum/loader'
import { getCurriculumState } from '@/core/curriculum/progress'
import { msUntilTomorrow, formatCountdown } from '@/core/time/countdown'
import { loadAllBundledPacks } from '@/core/drills/loader'
import { listAttemptsBySession } from '@/core/storage/attemptsRepo'
import { listSessionAggregates } from '@/core/storage/sessionsRepo'
import { getShieldedDayKeys } from '@/core/progress/streakShield'
import { computeStreakFromAggregates } from '@/core/progress/streak'
import { clearSessionMeta } from '@/core/profile/sessionMeta'
import { getSettings } from '@/core/storage/settingsRepo'

type Props = NativeStackScreenProps<RootStackParamList, 'DayComplete'>

export function DayCompleteScreen({ navigation, route }: Props) {
  const { sessionId, completedDayId } = route.params
  const [activeCurriculum, setActiveCurriculum] = useState<'phase1' | 'pro_regimen' | 'pro_regimen12'>('phase1')
  const [activeTrack, setActiveTrack] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')

  useEffect(() => {
    getSettings()
      .then((s) => {
        setActiveCurriculum((s.activeCurriculum ?? 'phase1') as any)
        setActiveTrack((s.activeTrack ?? 'beginner') as any)
      })
      .catch(() => {})
  }, [])

  const curr = useMemo(() => loadCurriculum(activeCurriculum as any, activeTrack as any), [activeCurriculum, activeTrack])
  const pack = useMemo(() => loadAllBundledPacks(), [])

  const [avgScore, setAvgScore] = useState<number | null>(null)
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [celebrate, setCelebrate] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [next, setNext] = useState<{ id: string; title: string; focus: string; drills: string[] } | null>(null)
  const [unlockIn, setUnlockIn] = useState<string | null>(null)
  const [streakDays, setStreakDays] = useState<number | null>(null)
  const streakScale = useRef(new Animated.Value(0.85)).current

  const completedDay = useMemo(() => curr.days.find((d) => d.id === completedDayId) ?? null, [curr.days, completedDayId])

  useEffect(() => {
    ;(async () => {
      const s = await getSettings().catch(() => null)
      setSoundEnabled(!!s?.soundCues)

      const atts = await listAttemptsBySession(sessionId)
      const scores = atts.map((a) => a.score)
      const a = scores.length ? scores.reduce((x, y) => x + y, 0) / scores.length : 0
      setAvgScore(a)
      setBestScore(scores.length ? Math.max(...scores) : 0)

      const cst = await getCurriculumState(curr)
      if (cst.doneToday && cst.nextDay) {
        const drillTitles = (cst.nextDay.drillIds ?? [])
          .map((id) => pack.drills.find((x) => x.id === id)?.title ?? id)
          .slice(0, 3)
        setNext({ id: cst.nextDay.id, title: cst.nextDay.title, focus: cst.nextDay.focus, drills: drillTitles })
        setUnlockIn(formatCountdown(msUntilTomorrow()))
      } else {
        setNext(null)
        setUnlockIn(null)
      }

      // Streak (after this session)
      const rows = await listSessionAggregates(180)
      const aggs = rows
        .filter((r) => r.attemptCount > 0)
        .map((r) => ({ startedAt: r.startedAt, avgScore: Math.round(r.avgScore), attemptCount: r.attemptCount }))
      const shielded = await getShieldedDayKeys().catch(() => [])
      const st = computeStreakFromAggregates(aggs, shielded)
      setStreakDays(st)
    })().catch(() => {})
  }, [curr, pack.drills, sessionId])

  useEffect(() => {
    if (!next) return
    const id = setInterval(() => setUnlockIn(formatCountdown(msUntilTomorrow())), 1000)
    return () => clearInterval(id)
  }, [next?.id])

  useEffect(() => {
    if (streakDays == null) return
    streakScale.setValue(0.85)
    Animated.spring(streakScale, { toValue: 1, useNativeDriver: true, friction: 4, tension: 120 }).start()
  }, [streakDays])

  const goHome = () => {
    clearSessionMeta(sessionId)
    navigation.replace('MainTabs' as any)
  }

  const openOverview = () => {
    // Clear meta so it doesn't leak; overview is a safe endpoint.
    clearSessionMeta(sessionId)
    navigation.replace('CurriculumOverview' as any)
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('dayComplete.title')}</Text>
        <Text preset="muted">{t('dayComplete.subtitle')}</Text>
      </Box>

      <Card tone="glow">
        <Text preset="h2">{t('dayComplete.completedTitle')}</Text>
        {completedDay ? (
          <>
            <Text preset="body" style={{ fontWeight: '900' }}>
              {t('curriculum.dayLabel', { week: completedDay.week, day: completedDay.day })}: {completedDay.title}
            </Text>
            <Text preset="muted">{completedDay.focus}</Text>
          </>
        ) : (
          <Text preset="muted">{t('dayComplete.completedFallback')}</Text>
        )}

        <Box style={{ marginTop: 12, flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <Kpi label={t('dayComplete.kpi.avg')} value={avgScore == null ? '—' : String(Math.round(avgScore))} />
          <Kpi label={t('dayComplete.kpi.best')} value={bestScore == null ? '—' : String(Math.round(bestScore))} />
          {streakDays != null ? (
            <Animated.View style={{ transform: [{ scale: streakScale }] }}>
              <Kpi label={t('dayComplete.kpi.streak')} value={`🔥 ${streakDays}`} />
            </Animated.View>
          ) : null}
        </Box>

        <Box style={{ marginTop: 12, gap: 10 }}>
          <Button text={t('dayComplete.viewResults')} variant="soft" onPress={() => navigation.replace('Results' as any, { sessionId })} />
          <Button text={t('dayComplete.postToCommunity')} variant="ghost" onPress={() => navigation.navigate('CreatePost' as any)} />
        </Box>
      </Card>

      {next ? (
        <Card tone="elevated">
          <Text preset="h2">{t('dayComplete.nextTitle')}</Text>
          <Text preset="muted">{t('dayComplete.tomorrowHint')}</Text>
          <Text preset="body" style={{ fontWeight: '900' }}>
            {t('curriculum.dayLabel', { week: numberFromId(next.id, curr), day: dayNumberFromId(next.id, curr) })}: {next.title}
          </Text>
          <Text preset="muted">{next.focus}</Text>
          {next.drills.length ? <Text preset="muted">{t('dayComplete.nextDrills', { value: next.drills.join(' • ') })}</Text> : null}
          {unlockIn ? <Text preset="muted" style={{ fontWeight: '900' }}>{t('dayComplete.unlocksIn', { value: unlockIn })}</Text> : null}

          <Box style={{ marginTop: 12, gap: 10 }}>
            <Button text={t('dayComplete.openOverview')} onPress={openOverview} />
            <Button text={t('dayComplete.backHome')} variant="ghost" onPress={goHome} />
          </Box>
        </Card>
      ) : (
        <Card>
          <Text preset="h2">{t('dayComplete.nextTitle')}</Text>
          <Text preset="muted">{t('dayComplete.tomorrowHint')}</Text>
          <Text preset="muted">{t('dayComplete.nextFallback')}</Text>
          <Box style={{ marginTop: 12, gap: 10 }}>
            <Button text={t('dayComplete.openOverview')} onPress={openOverview} />
            <Button text={t('dayComplete.backHome')} variant="ghost" onPress={goHome} />
          </Box>
        </Card>
      )}

      <CelebrationOverlay
        visible={celebrate}
        kind="win"
        emoji="✨"
        title={t('dayComplete.celebrateTitle')}
        subtitle={t('dayComplete.celebrateSubtitle')}
        soundEnabled={soundEnabled}
        onDone={() => setCelebrate(false)}
      />
    </Screen>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Box style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}>
      <Text preset="muted">{label}</Text>
      <Text preset="body" style={{ fontWeight: '900' }}>
        {value}
      </Text>
    </Box>
  )
}

function numberFromId(dayId: string, curr: { days: { id: string; week: number }[] }) {
  const d = curr.days.find((x) => x.id === dayId)
  return d?.week ?? 1
}

function dayNumberFromId(dayId: string, curr: { days: { id: string; day: number }[] }) {
  const d = curr.days.find((x) => x.id === dayId)
  return d?.day ?? 1
}