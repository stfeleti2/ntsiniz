import React, { useEffect, useMemo, useRef, useState } from "react"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Screen } from "@/ui/components/Screen"
import { Text } from "@/ui/components/Typography"
import { Button } from "@/ui/components/Button"
import { Card } from "@/ui/components/Card"
import type { RootStackParamList } from "../navigation/types"
import { getSession, listSessions } from "@/core/storage/sessionsRepo"
import { listAttemptsBySession, type Attempt } from "@/core/storage/attemptsRepo"
import { listBestTakeAttemptIdsForSession } from '@/core/storage/bestTakesRepo'
import { listSessionAggregates } from "@/core/storage/sessionsRepo"
import { computeMilestones } from "@/core/progress/milestones"
import { streaksFromAggregates } from "@/core/progress/streaks"
import { ProgressCard } from "@/core/share/ProgressCard"
import { shareViewAsImage } from "@/core/share/shareProgressCard"
import { CelebrationOverlay } from "@/ui/components/CelebrationOverlay"
import { SparkleBurst } from "@/ui/components/SparkleBurst"
import { getSettings } from "@/core/storage/settingsRepo"
import { t } from '@/app/i18n'
import { Box } from '@/ui'
import { NextActionBar } from '@/ui/components/NextActionBar'
import { loadAllBundledPacks } from '@/core/drills/loader'
import { AttemptWaveformList, ResultsScoreModule, ResultsShareModule, useModuleEnabled } from '@/ui/modules'
import { track } from '@/app/telemetry'
import { clearSessionMeta } from '@/core/profile/sessionMeta'
import { captureException } from '@/app/telemetry/sentry'
import { getVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { getAdaptiveJourneyState } from '@/core/guidedJourney/adaptiveStateRepo'
import { NextStepCard, PlaybackInsightCard } from '@/ui/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, "Results">
const uiCopy = {
  coachNoteTitle: 'Coach note',
  nextDrillTitle: 'Next recommended drill',
  continueTraining: 'Continue training',
}

export function ResultsScreen({ navigation, route }: Props) {
  const { sessionId } = route.params
  const pack = useMemo(() => loadAllBundledPacks(), [])
  const [tip, setTip] = useState<string>("")
  const [summary, setSummary] = useState<string>("")
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [bestByDrill, setBestByDrill] = useState<Record<string, string>>({})
  const [baselineAvg, setBaselineAvg] = useState<number | null>(null)
  const [milestonesText, setMilestonesText] = useState<{ day7: string; day30: string } | null>(null)
  const [prevSessionAvg, setPrevSessionAvg] = useState<number | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [celebrate, setCelebrate] = useState<null | { kind: "pb" | "streak"; emoji: string; title: string; subtitle?: string }>(
    null,
  )
  const didCelebrate = useRef(false)
  const [shareToast, setShareToast] = useState<string | null>(null)
  const [voiceTip, setVoiceTip] = useState<string | null>(null)
  const [nextHint, setNextHint] = useState<string | null>(null)

  useEffect(() => {
    // Session meta is an in-memory map; clear it once we've reached a safe endpoint.
    clearSessionMeta(sessionId)
    ;(async () => {
      const settings = await getSettings()
      setSoundEnabled(!!settings.soundCues)

      const s = await getSession(sessionId)
      setTip(s?.tip ?? "")
      setSummary(s?.summary ?? "")
      const atts = await listAttemptsBySession(sessionId)
      setAttempts(atts)
      const bestGuided = [...atts]
        .filter((attempt) => attempt.metrics?.guidedJourney)
        .sort((left, right) => right.score - left.score)[0]
      const [voice, adaptive] = await Promise.all([getVoiceIdentity().catch(() => null), getAdaptiveJourneyState().catch(() => null)])
      setVoiceTip(bestGuided?.metrics?.guidedJourney?.coachTip ?? voice?.currentFocus?.[0] ?? null)
      setNextHint(
        adaptive?.lastRecommendedFamily
          ? `Next family emphasis: ${String(adaptive.lastRecommendedFamily).replace(/_/g, ' ')}.`
          : voice?.currentFocus?.[0] ?? null,
      )

      // Best-takes for the session (drillId -> attemptId)
      const best = await listBestTakeAttemptIdsForSession(sessionId).catch(() => ({}))
      setBestByDrill(best)

      const sessions = await listSessions(200)
      const oldest = sessions[sessions.length - 1]
      if (oldest) {
        const oldAttempts = await listAttemptsBySession(oldest.id)
        setBaselineAvg(avg(oldAttempts.map((a) => a.score)))
      }

      // milestone comparisons (baseline / day7 / day30) based on session aggregates
      const aggs = await listSessionAggregates(200)
      const ms = computeMilestones(aggs.map((a) => ({ id: a.id, startedAt: a.startedAt, avgScore: a.avgScore, attemptCount: a.attemptCount })))
      setMilestonesText({
        day7: formatMilestone(ms.day7),
        day30: formatMilestone(ms.day30),
      })

      // Celebration triggers (PB / streak) — one-time per visit
      if (!didCelebrate.current) {
        const curAgg = aggs.find((x) => x.id === sessionId)
        if (curAgg) {
          const prevAggs = aggs.filter((x) => x.startedAt < curAgg.startedAt)

          const prevSorted = [...prevAggs].sort((a, b) => b.startedAt - a.startedAt)
          setPrevSessionAvg(prevSorted[0]?.avgScore ?? null)

          const bestBefore = prevAggs.length ? Math.max(...prevAggs.map((x) => x.avgScore)) : null
          const isNewBestSession = typeof bestBefore === "number" ? curAgg.avgScore > bestBefore : false

          const curStreak = streaksFromAggregates(aggs).currentStreakDays
          const prevStreak = streaksFromAggregates(prevAggs).currentStreakDays
          const streakLeveledUp = curStreak >= 2 && curStreak > prevStreak

          if (isNewBestSession) {
            didCelebrate.current = true
            setCelebrate({ kind: "pb", emoji: "🏆", title: t('results.celebrate.pbTitle'), subtitle: t('results.celebrate.pbSubtitle') })
          } else if (streakLeveledUp) {
            didCelebrate.current = true
            setCelebrate({ kind: "streak", emoji: "🔥", title: t('results.celebrate.streakTitle', { days: curStreak }), subtitle: t('results.celebrate.streakSubtitle') })
          }
        }
      }
    })().catch((e) => captureException(e, { screen: 'Results', sessionId }))
  }, [sessionId])

  const avgScore = useMemo(() => avg(attempts.map((a) => a.score)), [attempts])
  const delta = baselineAvg == null ? null : Math.round(avgScore - baselineAvg)
  const improvedVsPrev = prevSessionAvg != null && avgScore > prevSessionAvg

  const showScoreModule = useModuleEnabled('module.results.score')
  const showShareModule = useModuleEnabled('module.results.share')

  const cardRef = useRef<React.ElementRef<typeof Box> | null>(null)

  const share = async () => {
    if (!cardRef.current) return
    const s = await getSettings().catch(() => null)
    if (s?.qaMockShare) {
      setShareToast(t('results.shared'))
      setTimeout(() => setShareToast(null), 1800)
      return
    }
    await shareViewAsImage(cardRef.current)
    setShareToast(t('results.shared'))
    setTimeout(() => setShareToast(null), 1800)
    track('share_session_result', { sessionId })
  }

  return (
    <Screen scroll background="gradient">
      <Text preset="h1">{t('results.title')}</Text>
      <Text preset="muted">{summary || ""}</Text>

      {voiceTip ? <PlaybackInsightCard title={uiCopy.coachNoteTitle} body={voiceTip} /> : null}
      {nextHint ? <NextStepCard title={uiCopy.nextDrillTitle} body={nextHint} cta={uiCopy.continueTraining} onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Session' })} /> : null}

      {showScoreModule ? (
        <ResultsScoreModule
          score={avgScore}
          deltaValue={t('results.baselineChange', { value: delta == null ? '—' : `${delta > 0 ? '+' : ''}${delta}` })}
          milestones={milestonesText ?? undefined}
          scoreDecoration={<SparkleBurst enabled={improvedVsPrev} triggerKey={`${sessionId}-${Math.round(avgScore)}`} />}
          testID="results.score"
        />
      ) : (
        <Card>
          <Text preset="h2">{t('results.scoreTitle')}</Text>
          <Box style={{ position: "relative", alignSelf: "flex-start" }}>
            <SparkleBurst enabled={improvedVsPrev} triggerKey={`${sessionId}-${Math.round(avgScore)}`} />
            <Text preset="h1">{Math.round(avgScore)}</Text>
          </Box>
          <Text preset="muted">{t('results.baselineChange', { value: delta == null ? '—' : `${delta > 0 ? '+' : ''}${delta}` })}</Text>
          {milestonesText ? (
            <>
              <Text preset="muted">{t('results.day7', { value: milestonesText.day7 })}</Text>
              <Text preset="muted">{t('results.day30', { value: milestonesText.day30 })}</Text>
            </>
          ) : null}
        </Card>
      )}

      <Card>
        <Text preset="h2">{t('results.tipTitle')}</Text>
        <Text preset="body">{tip || t('results.defaultTip')}</Text>
      </Card>

      <Card>
        <Text preset="h2">{t('results.attemptsTitle')}</Text>
        <AttemptWaveformList
          attempts={attempts}
          drillTitleById={(id) => pack.drills.find((d) => d.id === id)?.title ?? id}
          bestAttemptIdByDrillId={bestByDrill}
          getAudioUri={(a) => (a as any)?.metrics?.audioUri}
          onOpenAttempt={(a) => (navigation as any).navigate('Playback', { attemptId: a.id })}
          testID="attempt-waveform-list"
        />
      </Card>

      {showShareModule ? (
        <ResultsShareModule
          cardRef={cardRef}
          scoreNow={Math.round(avgScore)}
          delta={delta ?? undefined}
          onShare={share}
          toast={shareToast}
          testID="results.share"
        />
      ) : (
        <Card>
          <Text preset="h2">{t('results.shareProgressTitle')}</Text>
          <Box style={{ alignItems: "center" }}>
            <ProgressCard ref={cardRef} stats={{ label: t('results.todayLabel'), scoreNow: Math.round(avgScore), delta: delta ?? undefined }} />
          </Box>
          <Button text={t('results.share')} onPress={share} testID="btn-results-share" />

          {shareToast ? (
            <Box style={{ marginTop: 10, alignItems: "center" }}>
              <Text preset="muted">{shareToast}</Text>
            </Box>
          ) : null}
        </Card>
      )}

      <NextActionBar
        title={t('home.whatNowTitle')}
        subtitle={t('missions.subtitle')}
        primaryLabel={t('home.startSession')}
        onPrimary={() => (navigation as any).navigate('MainTabs', { screen: 'Session' })}
        secondaryLabel={t('home.viewCurriculum')}
        onSecondary={() => navigation.navigate('CurriculumOverview')}
      />

      <Button text={t('results.backToHome')} onPress={() => navigation.replace('MainTabs')} testID="btn-results-home" />
      <Button text={t('journey.title')} variant="ghost" onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Journey' })} testID="btn-results-journey" />

      <CelebrationOverlay
        visible={!!celebrate}
        kind={celebrate?.kind ?? "win"}
        emoji={celebrate?.emoji ?? "✨"}
        title={celebrate?.title ?? ""}
        subtitle={celebrate?.subtitle}
        pills={
          celebrate?.kind === "streak"
            ? [{ emoji: "🔥", text: celebrate.title }]
            : celebrate?.kind === "pb"
              ? [{ emoji: '🏆', text: t('results.celebrate.pbPill') }]
              : undefined
        }
        soundEnabled={soundEnabled}
        onDone={() => setCelebrate(null)}
      />
    </Screen>
  )
}

function avg(xs: number[]) {
  if (!xs.length) return 0
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

function formatMilestone(p: { score: number; dateMs: number } | null) {
  if (!p) return "—"
  const d = new Date(p.dateMs)
  const ds = d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
  return `${p.score} (${ds})`
}
