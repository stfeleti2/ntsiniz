import React, { useEffect, useMemo, useState } from "react"
import { CompositeScreenProps } from "@react-navigation/native"
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Screen } from "@/ui/components/Screen"
import { Text } from "@/ui/components/Typography"
import { Card } from "@/ui/components/Card"
import { Button } from "@/ui/components/Button"
import { ProgressBar } from '@/ui/components/ProgressBar'
import type { MainTabParamList, RootStackParamList } from "../navigation/types"
import { listSessionAggregates } from "@/core/storage/sessionsRepo"
import { getProfile } from "@/core/storage/profileRepo"
import { computeJourney, nextMission, PHASE1_JOURNEY, type JourneyStats } from "@/core/progress/journeyPath"
import { computeHeatmapDays } from "@/core/progress/heatmap"
import { getSettings } from '@/core/storage/settingsRepo'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { HomeHeroModule, HomeRecommendedModule, useModuleEnabled } from '@/ui/modules'
import { NextActionBar } from '@/ui/components/NextActionBar'
import { captureException } from '@/app/telemetry/sentry'
import { loadCurriculum } from '@/core/curriculum/loader'
import { getCurriculumState } from '@/core/curriculum/progress'
import { msUntilTomorrow, formatCountdown } from '@/core/time/countdown'
import { getDailyChallenge, getDailyChallengeBest } from '@/core/challenges/dailyChallenge'
import { applyShieldForDay, getShieldedDayKeys, getStreakShieldStatus } from '@/core/progress/streakShield'
import { getDailyMissions } from '@/core/retention/missions'
import { recoverOrphanTakes } from '@/core/audio/takeRecovery'
import { listOrphanSavedTakes } from '@/core/storage/takeFilesRepo'

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>

export function HomeScreen({ navigation }: Props) {
  const [stats, setStats] = useState<JourneyStats | null>(null)
  const [streak, setStreak] = useState(0)
  const [planTitle, setPlanTitle] = useState<string | null>(null)
  const [planSubtitle, setPlanSubtitle] = useState<string | null>(null)
  const [planDayId, setPlanDayId] = useState<string | null>(null)
  const [currProg, setCurrProg] = useState<{ done: number; total: number; pct: number } | null>(null)
  const [currDoneToday, setCurrDoneToday] = useState(false)
  const [currTomorrow, setCurrTomorrow] = useState<{ id: string; title: string; focus: string } | null>(null)
  const [unlockIn, setUnlockIn] = useState<string | null>(null)
  const [challengeBest, setChallengeBest] = useState<number | null>(null)
  const [shield, setShield] = useState<{ available: boolean; canApplyForYesterday: boolean; yesterdayKey: number } | null>(null)
  const [reminderDue, setReminderDue] = useState(false)
  const [dailyMissions, setDailyMissions] = useState<Awaited<ReturnType<typeof getDailyMissions>> | null>(null)
  const [recoveredTakes, setRecoveredTakes] = useState<number>(0)
  const [orphanTakes, setOrphanTakes] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      // Data safety: recover any takes left in a temp state after a crash/app kill mid-save.
      const rec = await recoverOrphanTakes().catch(() => null)
      if (rec?.recovered) setRecoveredTakes(rec.recovered)

      const orphan = await listOrphanSavedTakes(5).catch(() => [])
      setOrphanTakes(orphan.length)

      const rows = await listSessionAggregates(180)
      const aggs = rows
        .filter((r) => r.attemptCount > 0)
        .map((r) => ({ id: r.id, startedAt: r.startedAt, endedAt: r.endedAt ?? null, avgScore: Math.round(r.avgScore), attemptCount: r.attemptCount }))

      const profile = await getProfile()

      const totalSessions = aggs.length
      const bestScore = Math.max(0, ...aggs.map((a) => a.avgScore))
      const lastScore = aggs.length ? aggs[aggs.length - 1].avgScore : 0
      const last7Avg = avgLastDays(aggs, 7)

      setStats({ totalSessions, bestScore, lastScore, last7Avg, profile })

      const hm = computeHeatmapDays({ aggs, endMs: Date.now(), days: 30 })
      const shielded = await getShieldedDayKeys().catch(() => [])
      setStreak(computeCurrentStreak(hm, shielded))

      // In-app reminders (offline). If enabled and it's past the chosen time and no session today → nudge.
      const s = await getSettings().catch(() => null)
      if (s?.remindersEnabled) {
        const now = new Date()
        const dueMin = (s.reminderHour ?? 19) * 60 + (s.reminderMinute ?? 0)
        const nowMin = now.getHours() * 60 + now.getMinutes()
        const todayKey = startOfDay(Date.now())
        const today = hm.find((d) => toDayKey(d.dayMs) === todayKey)
        setReminderDue(nowMin >= dueMin && (today?.sessions ?? 0) === 0)
      } else {
        setReminderDue(false)
      }

      // Curriculum plan
      const curr = loadCurriculum((s?.activeCurriculum ?? 'phase1') as any, (s?.activeTrack ?? 'beginner') as any)
      const currState = await getCurriculumState(curr)
      const day = currState.todayDay
      setPlanTitle(day ? `${t('curriculum.dayLabel', { day: day.day, week: day.week })}: ${day.title}` : null)
      setPlanSubtitle(day ? day.focus : null)
      setPlanDayId(day ? day.id : null)
      setCurrProg({ done: currState.doneCount, total: currState.total, pct: currState.pct })
      setCurrDoneToday(currState.doneToday)
      setCurrTomorrow(currState.nextDay ? { id: currState.nextDay.id, title: currState.nextDay.title, focus: currState.nextDay.focus } : null)
      if (!currState.doneToday) setUnlockIn(null)

      // Daily challenge
      setChallengeBest(await getDailyChallengeBest().catch(() => null))

      // Shield status
      setShield(await getStreakShieldStatus().catch(() => null))

      // EPIC 20: missions + weekly goal
      setDailyMissions(await getDailyMissions().catch(() => null))
    })().catch((e) => captureException(e, { screen: 'Home' }))
  }, [])

  useEffect(() => {
    if (!currDoneToday || !currTomorrow) return
    const id = setInterval(() => setUnlockIn(formatCountdown(msUntilTomorrow())), 1000)
    return () => clearInterval(id)
  }, [currDoneToday, currTomorrow?.id])

  const nodes = useMemo(() => (stats ? computeJourney(PHASE1_JOURNEY, stats) : []), [stats])
  const mission = useMemo(() => (nodes.length ? nextMission(nodes) : null), [nodes])
  const heroEnabled = useModuleEnabled('module.home.hero')
  const recommendedEnabled = useModuleEnabled('module.home.recommended')

  return (
    <Screen scroll background="hero">
      {recoveredTakes ? (
        <Card tone="elevated">
          <Text preset="h2">{t('home.recovery.title') ?? 'Recovered recording'}</Text>
          <Text preset="muted">
            {t('home.recovery.body', { count: recoveredTakes }) ?? `We recovered ${recoveredTakes} unfinished recording(s) after an unexpected exit.`}
          </Text>
          <Box style={{ height: 10 }} />
          <Button text={t('common.ok') ?? 'OK'} onPress={() => setRecoveredTakes(0)} />
        </Card>
      ) : null}

      {!recoveredTakes && orphanTakes ? (
        <Card tone="elevated">
          <Text preset="h2">{t('home.orphanTakes.title') ?? 'Recovered takes found'}</Text>
          <Text preset="muted">
            {t('home.orphanTakes.body', { count: orphanTakes }) ?? `You have ${orphanTakes} recording(s) saved, but not attached to a session.`}
          </Text>
          <Box style={{ height: 10 }} />
          <Button text={t('home.orphanTakes.cta') ?? 'Review takes'} onPress={() => (navigation as any).navigate('RecoveredTakes')} />
        </Card>
      ) : null}

      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('home.todayTitle')}</Text>
        <Text preset="muted">{t('home.todaySubtitle')}</Text>
      </Box>

      <NextActionBar
        title={t('home.whatNowTitle')}
        subtitle={
          planTitle
            ? planTitle
            : mission
              ? mission.title
              : t('home.whatNowFallback')
        }
        primaryLabel={planDayId && !currDoneToday ? t('home.continuePlan') : t('home.startSession')}
        onPrimary={() => {
          if (planDayId && !currDoneToday) navigation.navigate('CurriculumDayPreview', { dayId: planDayId })
          else navigation.navigate('Session', mission ? { missionId: mission.id } : undefined)
        }}
        secondaryLabel={t('home.viewCurriculum')}
        onSecondary={() => navigation.navigate('CurriculumOverview')}
      />

      <Card tone="elevated">
        <Text preset="h2">{t('home.weeklyReportTitle') ?? 'Weekly report'}</Text>
        <Text preset="muted">{t('home.weeklyReportBody') ?? 'See proof of improvement and share your progress.'}</Text>
        <Box style={{ height: 10 }} />
        <Button text={t('home.weeklyReportCta') ?? 'Open weekly report'} onPress={() => (navigation as any).navigate('WeeklyReport')} />
      </Card>

      <Card tone="glow">
        <Text preset="h2">{t('home.pitchLockChallengeTitle') ?? '7‑Day Pitch Lock'}</Text>
        <Text preset="muted">{t('home.pitchLockChallengeBody') ?? 'One short session a day. Build a streak and share it.'}</Text>
        <Box style={{ height: 10 }} />
        <Button text={t('home.pitchLockChallengeCta') ?? 'Start the challenge'} onPress={() => (navigation as any).navigate('PitchLockChallenge')} />
      </Card>

      {heroEnabled ? (
        <HomeHeroModule
          testID="home.hero"
          stats={{
            streakDays: streak,
            lastScore: stats?.lastScore ?? 0,
            last7Avg: stats?.last7Avg ?? 0,
            bestScore: stats?.bestScore ?? 0,
          }}
          onStartSession={() => (navigation as any).navigate('Session')}
          onOpenTuner={() => (navigation as any).getParent()?.navigate('Tuner')}
        />
      ) : (
        <Card tone="glow">
          <Text preset="h2">{t('home.vibeTitle')}</Text>
          <Box style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Pill text={t('home.pill.streakDay', { days: streak })} emoji="🔥" />
            <Pill text={t('home.pill.lastScore', { value: stats?.lastScore ?? 0 })} emoji="🎯" />
            <Pill text={t('home.pill.last7Avg', { value: stats?.last7Avg ?? 0 })} emoji="📈" />
            <Pill text={t('home.pill.bestScore', { value: stats?.bestScore ?? 0 })} emoji="🏆" />
          </Box>

          <Box style={{ marginTop: 12, gap: 10 }}>
            <Button text={t('home.startDailySession')} onPress={() => (navigation as any).navigate('Session')} />
            <Button text={t('home.openTuner')} variant="soft" onPress={() => (navigation as any).getParent()?.navigate("Tuner")} />
          </Box>
        </Card>
      )}

      {recommendedEnabled ? (
        <HomeRecommendedModule
          testID="home.recommended"
          mission={mission ? ({ id: mission.id, title: mission.title, subtitle: mission.subtitle, focusType: mission.focusType } as any) : null}
          onStartMission={(m) => (navigation as any).navigate('Session', { focusType: (m as any).focusType, missionId: m.id })}
          onOpenJourney={() => (navigation as any).navigate('Journey')}
        />
      ) : (
        <Card>
          <Text preset="h2">{t('home.nextMissionTitle')}</Text>
          {!mission ? (
            <Text preset="muted">{t('home.unlockJourney')}</Text>
          ) : (
            <>
              <Text preset="body" style={{ fontWeight: "900" }}>
                {mission.title}
              </Text>
              <Text preset="muted">{mission.subtitle}</Text>
              <Box style={{ marginTop: 10 }}>
                <Button
                  text={t('home.startMission')}
                  onPress={() => (navigation as any).navigate('Session', { focusType: mission.focusType, missionId: mission.id })}
                />
              </Box>
              <Button text={t('home.seeFullMap')} variant="ghost" onPress={() => (navigation as any).navigate('Journey')} />
            </>
          )}
        </Card>
      )}

      {/* EPIC 20: Daily missions (what now?) */}
      <Card tone="elevated">
        <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text preset="h2">{t('home.missionsTitle') ?? 'Missions'}</Text>
          <Button text={t('common.viewAll') ?? 'View'} variant="ghost" onPress={() => (navigation as any).navigate('Missions')} />
        </Box>

        {dailyMissions ? (
          <>
            <Box style={{ marginTop: 10, gap: 8 }}>
              <Text preset="muted">
                {t('home.thisWeek', { done: dailyMissions.weekly.doneSessions, goal: dailyMissions.weekly.goalSessions })}
              </Text>
              <ProgressBar pct={dailyMissions.weekly.pct} />
            </Box>

            <Box style={{ marginTop: 12, gap: 10 }}>
              {dailyMissions.missions.slice(0, 3).map((m, idx) => (
                <Box key={`${m.id}-${idx}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box style={{ flex: 1, paddingRight: 10 }}>
                    <Text preset="body" style={{ fontWeight: '900' }}>{m.done ? '✅' : '🎯'} {m.title}</Text>
                    <Text preset="muted">{m.subtitle}</Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        ) : (
          <Text preset="muted" style={{ marginTop: 10 }}>{t('common.loading')}</Text>
        )}
      </Card>

            {/* Curriculum: clear "what now" */}
      <Card tone="elevated">
        <Text preset="h2">{t('curriculum.title')}</Text>
        <Text preset="muted">{t('curriculum.subtitle')}</Text>

        {currProg ? (
          <Box style={{ marginTop: 10, gap: 8 }}>
            <ProgressBar pct={currProg.pct} />
            <Text preset="muted">{t('curriculum.progressLine', { done: currProg.done, total: currProg.total, pct: currProg.pct })}</Text>
          </Box>
        ) : null}

        {planTitle ? (
          <>
            <Box style={{ marginTop: 10, gap: 6 }}>
              <Text preset="body" style={{ fontWeight: '900' }}>{planTitle}</Text>
              {planSubtitle ? <Text preset="muted">{planSubtitle}</Text> : null}
            </Box>

            {currDoneToday && currTomorrow ? (
              <Box style={{ marginTop: 12, gap: 6 }}>
                <Text preset="body" style={{ fontWeight: '900' }}>{t('curriculum.doneForToday')}</Text>
                <Text preset="muted">{t('curriculum.tomorrowLine', { title: currTomorrow.title })}</Text>
                {unlockIn ? <Text preset="muted">{t('curriculum.unlocksIn', { value: unlockIn })}</Text> : null}

                <Box style={{ marginTop: 10, gap: 10 }}>
                  <Button
                    text={t('curriculum.previewTomorrow')}
                    variant="soft"
                    onPress={() => (navigation as any).getParent()?.navigate('CurriculumDayPreview', { dayId: currTomorrow.id })}
                  />
                  <Button
                    text={t('curriculum.openOverview')}
                    variant="ghost"
                    onPress={() => (navigation as any).getParent()?.navigate('CurriculumOverview')}
                  />
                </Box>
              </Box>
            ) : (
              <Box style={{ marginTop: 10, gap: 10 }}>
                <Button
                  text={t('curriculum.startToday')}
                  onPress={() => (navigation as any).navigate('Session', { curriculumDayId: planDayId })}
                />
                <Button
                  text={t('curriculum.openOverview')}
                  variant="ghost"
                  onPress={() => (navigation as any).getParent()?.navigate('CurriculumOverview')}
                />
              </Box>
            )}
          </>
        ) : (
          <Text preset="muted">{t('curriculum.notReady')}</Text>
        )}
      </Card>

      {reminderDue ? (
        <Card tone="glow">
          <Text preset="h2">{t('reminder.title')}</Text>
          <Text preset="muted">{t('reminder.subtitle')}</Text>
          <Button text={t('reminder.startNow')} onPress={() => (navigation as any).navigate('Session', { curriculumDayId: planDayId })} />
        </Card>
      ) : null}

      {/* Daily challenge (Phase 2 bridge) */}
      <Card>
        <Text preset="h2">{t('challenge.title')}</Text>
        <Text preset="muted">{t('challenge.subtitle')}</Text>
        {(() => {
          const c = getDailyChallenge()
          const best = challengeBest
          const done = typeof best === 'number'
          const pct = done ? Math.min(100, Math.round((best / c.targetScore) * 100)) : 0
          return (
            <>
              <Text preset="body" style={{ fontWeight: '900' }}>{c.title}</Text>
              <Text preset="muted">
                {done
                  ? t('challenge.bestLine', { best: Math.round(best!), target: c.targetScore, pct })
                  : t('challenge.targetLine', { target: c.targetScore })}
              </Text>
              <Box style={{ marginTop: 10 }}>
                <Button
                  text={done ? t('challenge.tryImprove') : t('challenge.start')}
                  variant={done ? 'soft' : 'primary'}
                  onPress={() => (navigation as any).navigate('Session', { dailyChallenge: true })}
                />
                <Button
                  text={t('challenge.openHub')}
                  variant="ghost"
                  onPress={() => (navigation as any).getParent()?.navigate('ChallengesHub')}
                />
              </Box>
            </>
          )
        })()}
      </Card>

      {/* Performance Mode (EPIC 11) */}
      <Card tone="glow">
        <Text preset="h2">{t('performance.homeTitle')}</Text>
        <Text preset="muted">{t('performance.homeSubtitle')}</Text>
        <Box style={{ marginTop: 10, gap: 10 }}>
          <Button text={t('performance.homeCta')} onPress={() => (navigation as any).getParent?.()?.navigate?.('PerformanceMode')} />
          <Button text={t('performance.homeAlt')} variant="soft" onPress={() => (navigation as any).navigate('Community')} />
        </Box>
      </Card>

      {/* Streak protection */}
      <Card>
        <Text preset="h2">{t('streakShield.title')}</Text>
        <Text preset="muted">{t('streakShield.subtitle')}</Text>
        {shield?.available ? (
          <>
            <Text preset="muted">{t('streakShield.available')}</Text>
            <Box style={{ marginTop: 10 }}>
              <Button
                text={t('streakShield.useForYesterday')}
                disabled={!shield.canApplyForYesterday}
                variant="soft"
                onPress={async () => {
                  await applyShieldForDay(shield.yesterdayKey)
                  // quick refresh
                  const rows = await listSessionAggregates(180)
                  const aggs = rows
                    .filter((r) => r.attemptCount > 0)
                    .map((r) => ({ id: r.id, startedAt: r.startedAt, endedAt: r.endedAt ?? null, avgScore: Math.round(r.avgScore), attemptCount: r.attemptCount }))
                  const hm = computeHeatmapDays({ aggs, endMs: Date.now(), days: 30 })
                  const shielded = await getShieldedDayKeys().catch(() => [])
                  setStreak(computeCurrentStreak(hm, shielded))
                  setShield(await getStreakShieldStatus().catch(() => null))
                }}
              />
            </Box>
          </>
        ) : (
          <Text preset="muted">{t('streakShield.cooldown')}</Text>
        )}
      </Card>

      <Card>
        <Text preset="h2">{t('home.shareableProofTitle')}</Text>
        <Text preset="muted">{t('home.shareableProofSubtitle')}</Text>
        <Button text={t('home.openJourney')} variant="ghost" onPress={() => (navigation as any).navigate('Journey')} />
      </Card>
    </Screen>
  )
}

function Pill({ emoji, text }: { emoji: string; text: string }) {
  return (
    <Box
      style={{
        flexDirection: "row",
        gap: 6,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        backgroundColor: "rgba(255,255,255,0.06)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
      }}
    >
      <Text preset="body" style={{ fontSize: 14 }}>
        {emoji}
      </Text>
      <Text preset="muted" style={{ fontWeight: "800" }}>
        {text}
      </Text>
    </Box>
  )
}

function avgLastDays(aggs: { startedAt: number; avgScore: number }[], days: number) {
  if (!aggs.length) return 0
  const end = Date.now()
  const start = end - days * 24 * 60 * 60 * 1000
  const xs = aggs.filter((a) => a.startedAt >= start && a.startedAt <= end).map((a) => a.avgScore)
  if (!xs.length) return 0
  return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length)
}

function computeCurrentStreak(days: { dayMs: number; sessions: number }[], shieldedDayKeys: number[] = []) {
  // days are ascending by time in computeHeatmapDays
  const sorted = [...days].sort((a, b) => a.dayMs - b.dayMs)
  // build a set for quick lookup of active days
  const active = new Set(sorted.filter((d) => d.sessions > 0).map((d) => toDayKey(d.dayMs)))

  for (const k of shieldedDayKeys) active.add(toDayKey(k))

  let streak = 0
  let cursor = startOfDay(Date.now())
  while (active.has(toDayKey(cursor))) {
    streak += 1
    cursor -= 24 * 60 * 60 * 1000
  }
  return streak
}

function startOfDay(ts: number) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function toDayKey(ts: number) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
