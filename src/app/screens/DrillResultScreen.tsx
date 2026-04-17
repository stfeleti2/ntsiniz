import React, { useEffect, useMemo, useRef, useState } from "react"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../navigation/types"
import { Screen } from "@/ui/components/Screen"
import { Text } from "@/ui/components/Typography"
import { Card } from "@/ui/components/kit"
import { Button } from "@/ui/components/kit"
import { NextActionBar } from '@/ui/components/NextActionBar'
import { loadAllBundledPacks } from "@/core/drills/loader"
import { getAttemptById, listAttemptsByDrill, type Attempt } from "@/core/storage/attemptsRepo"
import { getBestTakeAttemptId } from '@/core/storage/bestTakesRepo'
import { buildDrillBadges } from "@/core/share/drillBadges"
import { DrillResultCard } from "@/core/share/DrillResultCard"
import { shareViewAsImage } from "@/core/share/shareProgressCard"
import { CelebrationOverlay } from "@/ui/components/CelebrationOverlay"
import { getSettings } from "@/core/storage/settingsRepo"
import { t } from '@/app/i18n'
import { formatNumber } from '@/core/i18n'
import { Box } from '@/ui'
import { TakeBadge } from '@/ui/patterns'
import { track } from '@/app/telemetry'
import { reportUiError } from '@/app/telemetry/report'
import { markSharedWinForDay } from '@/core/retention/stateRepo'
import { dayKey } from '@/core/time/keys'
import { explainAttempt } from '@/core/coaching/whyMissed'
import { recommendFixDrillId } from '@/core/coaching/nextFix'
import { getSessionMeta, clearSessionMeta } from '@/core/profile/sessionMeta'
import { buildScoreBreakdown } from '@/core/coaching/scoreBreakdown'
import { gradePhraseFromMetrics } from '@/core/scoring/phraseGrader'
import { ShareCard } from '@/ui/share/ShareCard'
import { shareCapturedCard } from '@/ui/share/shareCardCapture'
import { View } from 'react-native'
import { scoreAttemptV2 } from '@/core/scoring/drillScoring'
import { getPublicLinks } from '@/core/config/links'
import { NextStepCard, ResultAnnotationCard } from '@/ui/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, "DrillResult"> 

export function DrillResultScreen({ navigation, route }: Props) {
  const { sessionId, attemptId, drillId, nextDrillId, endToResults } = route.params
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [trend, setTrend] = useState<number[]>([])
  const [bestBefore, setBestBefore] = useState<number | null>(null)
  const [prevBefore, setPrevBefore] = useState<number | null>(null)
  const [isBestTake, setIsBestTake] = useState(false)
  const cardRef = useRef<React.ElementRef<typeof Box> | null>(null)
  const shareCardRef = useRef<View | null>(null)

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [qaMockShare, setQaMockShare] = useState(false)
  const [shareMode, setShareMode] = useState(false)
  const [shareToast, setShareToast] = useState<string | null>(null)

  const [celebrate, setCelebrate] = useState<null | { kind: "pb"; emoji: string; title: string; subtitle?: string }>(
    null,
  )
  const didCelebrate = useRef(false)

  const pack = useMemo(() => loadAllBundledPacks(), [])
  const drill = useMemo(() => pack.drills.find((d) => d.id === drillId)!, [pack.drills, drillId])
  const links = useMemo(() => getPublicLinks(), []);
  const uiCopy = {
    greatTitle: 'Great session!',
    greatSubtitle: 'Fair scoring with clear next actions.',
    successTitle: 'Key success',
    fixTitle: 'Key fix',
    nextTitle: 'Next recommended action',
    finishLesson: 'Finish lesson',
    scoreCard: 'Drill score',
    bonus: 'Bonus progress',
    drillsCompleted: 'Drills completed',
    shareCard: 'Share card',
  }
  const guidedResult = attempt?.metrics?.guidedJourney as
    | {
        coachTip?: string
        band?: string
        family?: string
        passed?: boolean
        diagnosisTags?: string[]
      }
    | undefined

  useEffect(() => {
    ;(async () => {
      const settings = await getSettings()
      setSoundEnabled(!!settings.soundCues)
      setQaMockShare(!!settings.qaMockShare)

      const a = await getAttemptById(attemptId)
      setAttempt(a)
      const byDrill = await listAttemptsByDrill(drillId, 24)
      const asc = [...byDrill].sort((x, y) => x.createdAt - y.createdAt)
      setTrend(asc.slice(Math.max(0, asc.length - 12)).map((x) => x.score))

      if (a) {
        const prev = byDrill.filter((x) => x.id !== a.id && x.createdAt < a.createdAt)
        const best = prev.length ? Math.max(...prev.map((x) => x.score)) : null
        setBestBefore(best)

        const prevSorted = [...prev].sort((x, y) => y.createdAt - x.createdAt)
        setPrevBefore(prevSorted[0]?.score ?? null)

        const bestId = await getBestTakeAttemptId(sessionId, drillId).catch(() => null)
        setIsBestTake(bestId === a.id)
      }
    })().catch((e) => reportUiError(e))
  }, [attemptId, drillId, sessionId])

  const badges = useMemo(() => {
    if (!attempt) return []
    return buildDrillBadges({ attempt, bestScoreBefore: bestBefore })
  }, [attempt, bestBefore])

  useEffect(() => {
    if (!attempt) return
    if (didCelebrate.current) return
    const isPB = badges.some((b) => b.text === t('badges.personalBest'))
    if (!isPB) return
    didCelebrate.current = true
    setCelebrate({ kind: 'pb', emoji: '🏆', title: t('drillResult.celebrate.pbTitle'), subtitle: t('drillResult.celebrate.pbSubtitle') })
  }, [attempt, badges])

  const kpis = useMemo(() => {
    if (!attempt) return [] as { label: string; value: string }[]
    const m: any = attempt.metrics ?? {}
    const out: { label: string; value: string }[] = []
    if (typeof m.avgAbsCents === "number") out.push({ label: t('drillResult.kpi.accuracy'), value: `${Math.round(m.avgAbsCents)}c` })
    if (typeof m.wobbleCents === "number") out.push({ label: t('drillResult.kpi.stability'), value: `${Math.round(m.wobbleCents)}c` })
    if (typeof m.timeToEnterMs === "number") out.push({ label: t('drillResult.kpi.lockTime'), value: `${formatNumber(m.timeToEnterMs / 1000, { maximumFractionDigits: 1, minimumFractionDigits: 1 })}s` })
    if (typeof m.voicedRatio === "number") out.push({ label: t('drillResult.kpi.voiced'), value: `${Math.round(m.voicedRatio * 100)}%` })

    if (m.drillType === "interval" && typeof m.intervalErrorCents === "number") {
      out.push({ label: t('drillResult.kpi.intervalErr'), value: `${Math.round(Math.abs(m.intervalErrorCents))}c` })
    }
    if (m.drillType === "melody_echo" && typeof m.melodyHitRate === "number") {
      out.push({ label: t('drillResult.kpi.hitRate'), value: `${Math.round(m.melodyHitRate * 100)}%` })
    }
    if (m.drillType === "melody_echo" && typeof m.contourHitRate === "number") {
      out.push({ label: t('drillResult.kpi.contour'), value: `${Math.round(m.contourHitRate * 100)}%` })
    }
    if (m.drillType === "slide" && typeof m.glideSmoothness === "number") {
      out.push({ label: t('drillResult.kpi.smooth'), value: `${Math.round(m.glideSmoothness * 100)}%` })
    }

    return out.slice(0, 6)
  }, [attempt])

  const hints = useMemo(() => {
    if (!attempt) return [] as { title: string; body: string }[]
    // Coach-grade summary: keep it actionable and non-overwhelming.
    return explainAttempt(drill, attempt.metrics, attempt.score).slice(0, 3)
  }, [attempt, drill])

  const breakdown = useMemo(() => {
    if (!attempt) return null
    return buildScoreBreakdown(attempt.metrics, attempt.score)
  }, [attempt])

  const v2 = useMemo(() => {
    if (!attempt) return null
    // best-effort: attempt.metrics should already match AttemptMetrics shape.
    try {
      return scoreAttemptV2(attempt.metrics)
    } catch {
      return null
    }
  }, [attempt])

  const phraseGrade = useMemo(() => {
    if (!attempt) return null
    return gradePhraseFromMetrics(attempt.metrics, { difficulty: 'standard' })
  }, [attempt])

  const fixDrillId = useMemo(() => {
    if (!attempt) return null
    return recommendFixDrillId({ ...(attempt.metrics ?? {}), drillType: drill.type }, attempt.score)
  }, [attempt, drill])

  const share = async () => {
    if (!cardRef.current) return
    // Render a clean capture (no animations/sparkles) for crisp social sharing.
    setShareMode(true)
    try {
      if (qaMockShare) {
        setShareToast(t('common.shared'))
        setTimeout(() => setShareToast(null), 1800)
        await markSharedWinForDay(dayKey(Date.now())).catch(() => null)
        return
      }
      await new Promise((r) => setTimeout(r, 80))
      await shareViewAsImage(cardRef.current, `ntsiniz-drill-${drillId}.png`)
      setShareToast(t('common.shared'))
      setTimeout(() => setShareToast(null), 1800)
      track('share_drill_result', { sessionId, drillId, attemptId })
      await markSharedWinForDay(dayKey(Date.now())).catch(() => null)
    } finally {
      setShareMode(false)
    }
  }

  const shareCard = async () => {
    if (!shareCardRef.current) return
    setShareMode(true)
    try {
      if (qaMockShare) {
        setShareToast(t('common.shared'))
        setTimeout(() => setShareToast(null), 1800)
        await markSharedWinForDay(dayKey(Date.now())).catch(() => null)
        return
      }
      await new Promise((r) => setTimeout(r, 80))
      await shareCapturedCard(shareCardRef.current, `ntsiniz-card-drill-${drillId}.png`)
      setShareToast(t('common.shared'))
      setTimeout(() => setShareToast(null), 1800)
      track('share_drill_card', { sessionId, drillId, attemptId })
      await markSharedWinForDay(dayKey(Date.now())).catch(() => null)
    } finally {
      setShareMode(false)
    }
  }

  const continueNext = () => {
    if (endToResults) {
      const meta = getSessionMeta(sessionId)
      if (meta?.curriculumDayId) {
        navigation.replace('DayComplete', { sessionId, completedDayId: meta.curriculumDayId })
      } else {
        clearSessionMeta(sessionId)
        navigation.replace("SessionSummary", { sessionId })
      }
      return
    }
    if (nextDrillId) {
      navigation.replace("Drill", {
        sessionId,
        drillId: nextDrillId,
        packDrillId: route.params.nextPackDrillId,
        lessonId: route.params.lessonId,
        stageId: route.params.stageId,
      })
      return
    }
    ;(navigation as any).replace("MainTabs", { screen: "Session" })
  }

  if (!attempt) {
    return (
      <Screen background="gradient">
        <Text preset="h1">{t('drillResult.loadingTitle')}</Text>
        <Text preset="muted">{t('common.loading')}</Text>
      </Screen>
    )
  }

  const dateLabel = new Date(attempt.createdAt).toLocaleDateString()
  const deltaFromPrev = prevBefore == null ? undefined : attempt.score - prevBefore

  return (
    <Screen scroll background="gradient">
      <Text preset="h1">{uiCopy.greatTitle}</Text>
      <Text preset="muted">{uiCopy.greatSubtitle}</Text>

      <Card tone="glow">
        <Box style={{ gap: 10 }}>
          <Text preset="h3">{uiCopy.drillsCompleted}</Text>
          <Text preset="body">{endToResults ? t('common.finish') : t('common.next')}</Text>
          <Box style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Card style={{ padding: 10, minWidth: 120 }}>
              <Text preset="muted">{uiCopy.scoreCard}</Text>
              <Text preset="h2">{Math.round(attempt.score)}</Text>
            </Card>
            <Card style={{ padding: 10, minWidth: 120 }}>
              <Text preset="muted">{uiCopy.bonus}</Text>
              <Text preset="h2">{badges.length}</Text>
            </Card>
          </Box>
          <Text preset="muted">{guidedResult?.coachTip ?? t('coach.nextActionSubtitle')}</Text>
        </Box>
      </Card>

      {guidedResult ? (
        <>
          <ResultAnnotationCard
            title={uiCopy.successTitle}
            body={
              guidedResult.passed
                ? `You landed a real pass on ${guidedResult.family?.replace(/_/g, ' ') ?? 'this drill'}.`
                : `You still gave us a usable rep on ${guidedResult.family?.replace(/_/g, ' ') ?? 'this drill'}.`
            }
          />
          <ResultAnnotationCard
            title={uiCopy.fixTitle}
            body={guidedResult.coachTip ?? 'Keep the next correction smaller and calmer.'}
          />
          <NextStepCard
            title={uiCopy.nextTitle}
            body={endToResults ? 'Close the lesson, review the summary, and keep the next chapter moving.' : 'Take the next live drill while the same coaching cue is still fresh.'}
            cta={endToResults ? uiCopy.finishLesson : t('common.next')}
            onPress={continueNext}
          />
        </>
      ) : null}

      {isBestTake ? (
        <Box style={{ alignSelf: 'flex-start', marginTop: 6 }}>
          <TakeBadge status="best" />
        </Box>
      ) : null}

      <Card tone="glow">
        <Box style={{ alignItems: "center" }}>
          <DrillResultCard
            ref={cardRef}
            stats={{
              title: drill.title,
              subtitle: drill.type.replace(/_/g, " "),
              score: attempt.score,
              dateLabel,
              badges,
              kpis,
              trend,
              deltaFromPrev,
            }}
            effectsEnabled={!shareMode}
          />
        </Box>

        {/* Offscreen share card (captured via view-shot). */}
        <View
          ref={(r) => {
            shareCardRef.current = r
          }}
          collapsable={false}
          style={{ position: 'absolute', left: -5000, top: 0, width: 1080, height: 1080 }}
        >
          <ShareCard
            title={drill.title}
            subtitle={phraseGrade ? `${t('grading.label.' + phraseGrade.label)} • ${t('grading.reason.' + phraseGrade.reasonKey)}` : drill.type.replace(/_/g, ' ')}
            badge={phraseGrade ? t('grading.label.' + phraseGrade.label) : undefined}
            scoreLabel={t('share.scoreLabel')}
            scoreValue={String(Math.round(attempt.score))}
            footer={links.appUrl ? `Get the app: ${links.appUrl}` : undefined}
          />
        </View>

        <Box style={{ flexDirection: "row", gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
          <Button text={t('common.share')} onPress={share} testID="btn-drillresult-share" />
          <Button text={uiCopy.shareCard} onPress={shareCard} />
          <Button text={endToResults ? t('common.finish') : t('common.next')} variant="primary" onPress={continueNext} testID="btn-drillresult-next" />
        </Box>

        {shareToast ? (
          <Box style={{ marginTop: 10, alignItems: "center" }}>
            <Text preset="muted">{shareToast}</Text>
          </Box>
        ) : null}

        {hints.length ? (
          <Box style={{ marginTop: 14, gap: 8 }}>
            <Text preset="h2">{t('coach.whyTitle')}</Text>
            {hints.map((h) => (
              <Box key={h.title} style={{ gap: 4, paddingVertical: 6 }}>
                <Text preset="body" style={{ fontWeight: '900' }}>{h.title}</Text>
                <Text preset="muted">{h.body}</Text>
              </Box>
            ))}
          </Box>
        ) : null}

        {v2 ? (
          <Box style={{ marginTop: 14, gap: 8 }}>
            <Text preset="h2">{t('coach.scoreV2Title') ?? 'Score (effort + accuracy)'}</Text>
            <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <Card style={{ padding: 10, minWidth: 140 }}>
                <Text preset="muted">{t('coach.effort') ?? 'Effort'}</Text>
                <Text preset="h2">{v2.effort}</Text>
              </Card>
              <Card style={{ padding: 10, minWidth: 140 }}>
                <Text preset="muted">{t('coach.accuracy') ?? 'Accuracy'}</Text>
                <Text preset="h2">{v2.accuracy}</Text>
              </Card>
              <Card style={{ padding: 10, minWidth: 140 }}>
                <Text preset="muted">{t('coach.total') ?? 'Total'}</Text>
                <Text preset="h2">{v2.total}</Text>
              </Card>
            </Box>
          </Box>
        ) : null}

        {phraseGrade ? (
          <Box style={{ marginTop: 14, gap: 8 }}>
            <Text preset="h2">{t('grading.title')}</Text>
            <Card tone="glow" style={{ padding: 12 }}>
              <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <Text preset="h2">{t(`grading.label.${phraseGrade.label}` as any)}</Text>
                <Text preset="muted">{Math.round(phraseGrade.score * 100)}%</Text>
              </Box>
              <Box style={{ marginTop: 6, gap: 4 }}>
                <Text preset="muted">{t(`grading.reason.${phraseGrade.reasonKey}` as any)}</Text>
                <Text preset="body" style={{ fontWeight: '900' }}>{t(`grading.cue.${phraseGrade.cueKey}` as any)}</Text>
              </Box>
            </Card>
          </Box>
        ) : null}

        {breakdown ? (
          <Box style={{ marginTop: 14, gap: 8 }}>
            <Text preset="h2">{t('drillResult.breakdownTitle')}</Text>
            <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <Card style={{ padding: 10, minWidth: 140 }}>
                <Text preset="muted">{t('drillResult.breakdown.pitch')}</Text>
                <Text preset="h2">{Math.round(breakdown.pitch)}</Text>
              </Card>
              <Card style={{ padding: 10, minWidth: 140 }}>
                <Text preset="muted">{t('drillResult.breakdown.stability')}</Text>
                <Text preset="h2">{Math.round(breakdown.stability)}</Text>
              </Card>
              <Card style={{ padding: 10, minWidth: 140 }}>
                <Text preset="muted">{t('drillResult.breakdown.timing')}</Text>
                <Text preset="h2">{Math.round(breakdown.timing)}</Text>
              </Card>
              <Card style={{ padding: 10, minWidth: 140 }}>
                <Text preset="muted">{t('drillResult.breakdown.confidence')}</Text>
                <Text preset="h2">{Math.round(breakdown.confidence)}</Text>
              </Card>
            </Box>
            {breakdown.notes.length > 0 ? (
              <Box style={{ marginTop: 6, gap: 4 }}>
                {breakdown.notes.slice(0, 3).map((n, idx) => (
                  <Text key={`${n}-${idx}`} preset="muted">{t('common.bullet', { text: n })}</Text>
                ))}
              </Box>
            ) : null}
          </Box>
        ) : null}

        {attempt?.metrics?.recordingStats ? (
          <Box style={{ marginTop: 14, gap: 8 }}>
            <Text preset="h2">{t('audioQuality.title') ?? 'Audio quality'}</Text>
            <Card style={{ padding: 12 }}>
              {attempt.metrics.recordingStats.clippedFrames > 0 ? (
                <Text preset="muted">
                  {t('audioQuality.clipping') ?? 'Clipping detected. Try moving the phone slightly farther away or reducing volume.'}
                </Text>
              ) : (
                <Text preset="muted">{t('audioQuality.noClipping') ?? 'No clipping detected.'}</Text>
              )}
              {attempt.metrics.recordingStats.peakAvg < 0.03 ? (
                <Text preset="muted">
                  {t('audioQuality.tooQuiet') ?? 'Input is quite quiet. Try a quieter room, or get closer to the mic.'}
                </Text>
              ) : null}
              <Box style={{ height: 8 }} />
              <Button text={t('micTest.title') ?? 'Test mic'} variant="soft" onPress={() => (navigation as any).navigate('MicTest')} />
            </Card>
          </Box>
        ) : null}

        {fixDrillId ? (
          <Box style={{ marginTop: 14, gap: 8 }}>
            <Text preset="h2">{t('coach.nextActionTitle')}</Text>
            <Text preset="muted">{t('coach.nextActionSubtitle')}</Text>
            <Button
              text={t('coach.tryFixNow')}
              variant="primary"
              onPress={() => navigation.replace('Drill', { sessionId, drillId: fixDrillId })}
              testID="btn-coach-fix-now"
            />
          </Box>
        ) : null}
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} testID="btn-drillresult-back" />

      <CelebrationOverlay
        visible={!!celebrate}
        kind={celebrate?.kind ?? "win"}
        emoji={celebrate?.emoji ?? "✨"}
        title={celebrate?.title ?? ""}
        subtitle={celebrate?.subtitle}
        pills={badges}
        soundEnabled={soundEnabled}
        onDone={() => setCelebrate(null)}
      />
          <NextActionBar
        title={t('nextAction.resultTitle')}
        subtitle={t('nextAction.resultSubtitle')}
        primaryLabel={t('nextAction.tryNext')}
        onPrimary={() => {
          const nextId = recommendFixDrillId({ ...(attempt?.metrics ?? {}), drillType: drill.type }, attempt?.score) ?? nextDrillId ?? drillId
          navigation.replace('Drill', { sessionId, drillId: nextId })
        }}
        secondaryLabel={t('nextAction.playback')}
        onSecondary={() => navigation.navigate('Playback', { attemptId })}
        testID="next.action.result"
        primaryTestID="btn-next-try-next"
        secondaryTestID="btn-next-playback"
      />
    </Screen>
  )
}
