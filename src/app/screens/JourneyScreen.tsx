import React, { useEffect, useMemo, useRef, useState } from "react"
import { CompositeScreenProps } from "@react-navigation/native"
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Screen } from "@/ui/components/Screen"
import { Text } from "@/ui/components/Typography"
import { Button } from "@/ui/components/Button"
import { Card } from "@/ui/components/Card"
import { Segmented } from "@/ui/components/Segmented"
import type { MainTabParamList, RootStackParamList } from "../navigation/types"
import { useTheme } from "@/theme/useTheme"

import { listSessionAggregates } from "@/core/storage/sessionsRepo"
import { listRecentAttempts } from "@/core/storage/attemptsRepo"
import { getProfile } from "@/core/storage/profileRepo"
import { computeHeatmapDays } from "@/core/progress/heatmap"
import { computeWeeklyReport } from "@/core/report/weeklyReport"
import { WeeklyReportCard } from "@/core/share/WeeklyReportCard"
import { shareViewAsImage } from "@/core/share/shareProgressCard"
import { exportTrainingCsv } from "@/core/share/exportCsv"
import { getSettings } from "@/core/storage/settingsRepo"

import { PHASE1_JOURNEY, computeJourney, nextMission, type JourneyStats } from "@/core/progress/journeyPath"
import { JourneyMap } from "@/ui/journey/JourneyMap"
import { LinearGradient } from "expo-linear-gradient"
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { formatNumber } from '@/core/i18n'
import { reportUiError } from '@/app/telemetry/report'
import { JourneyHeaderModule, JourneyNextUpModule, useModuleEnabled } from '@/ui/modules'

// NOTE: this screen is intentionally “premium” — map + proof + share.

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Journey">,
  NativeStackScreenProps<RootStackParamList>
>

export function JourneyScreen({ navigation }: Props) {
  const [view, setView] = useState<"map" | "proof">("map")
  const [shareToast, setShareToast] = useState<string | null>(null)

  const [aggs, setAggs] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [weekly, setWeekly] = useState<any>(null)

  const weeklyCardRef = useRef<React.ElementRef<typeof Box> | null>(null)

  useEffect(() => {
    ;(async () => {
      const a = await listSessionAggregates(180)
      setAggs(a)

      const p = await getProfile()
      setProfile(p)

      const heatmap = computeHeatmapDays({ aggs: a, endMs: Date.now(), days: 28 })
      const w = await computeWeeklyReport({ aggs: a, endMs: Date.now() })
      setWeekly({ heatmap, ...w })
    })().catch((e) => reportUiError(e, { screen: 'Journey' }))
  }, [])

  const stats: JourneyStats | null = useMemo(() => {
    if (!aggs.length || !profile) return null

    const completed = aggs.filter((r) => r.attemptCount > 0)
    const totalSessions = completed.length
    const bestScore = Math.max(0, ...completed.map((a: any) => Math.round(a.avgScore)))
    const lastScore = completed.length ? Math.round(completed[completed.length - 1].avgScore) : 0

    const now = Date.now()
    const start = now - 7 * 24 * 60 * 60 * 1000
    const last7 = completed.filter((a: any) => a.startedAt >= start && a.startedAt <= now).map((a: any) => Math.round(a.avgScore))
    const last7Avg = last7.length ? Math.round(last7.reduce((x: number, y: number) => x + y, 0) / last7.length) : 0

    return { totalSessions, bestScore, lastScore, last7Avg, profile }
  }, [aggs, profile])

  const journeyNodes = useMemo(() => (stats ? computeJourney(PHASE1_JOURNEY, stats) : []), [stats])
  const mission = useMemo(() => (journeyNodes.length ? nextMission(journeyNodes) : null), [journeyNodes])
  const progress = useMemo(() => {
    if (!journeyNodes.length) return { done: 0, total: 0, pct: 0 }
    const done = journeyNodes.filter((n) => n.status === "complete").length
    const total = journeyNodes.length
    return { done, total, pct: total ? done / total : 0 }
  }, [journeyNodes])

  const shareWeekly = async () => {
    if (!weeklyCardRef.current) return
    const s = await getSettings().catch(() => null)
    if (s?.qaMockShare) {
      setShareToast(t('journey.shared'))
      setTimeout(() => setShareToast(null), 1800)
      return
    }
    await shareViewAsImage(weeklyCardRef.current, "ntsiniz-weekly-report.png")
    setShareToast(t('journey.shared'))
    setTimeout(() => setShareToast(null), 1800)
  }

  const exportCsv = async () => {
    const s = await getSettings().catch(() => null)
    // In QA/E2E mode we avoid the OS share sheet (it’s flaky to automate).
    if (s?.qaMockShare) {
      await exportTrainingCsv({ share: false })
      setShareToast(t('journey.csvReady'))
      setTimeout(() => setShareToast(null), 1800)
      return
    }
    await exportTrainingCsv()
  }

  const startMission = (m: any) => {
    ;(navigation as any).navigate('Session', { focusType: m.focusType, missionId: m.id })
  }

  return (
    <Screen scroll background="gradient">
      {useModuleEnabled('module.journey.header') ? (
        <JourneyHeaderModule
          tab={view}
          onTab={setView}
          onOpenLab={() => (navigation as any).navigate('ComponentLab')}
          testID="journey.header"
        />
      ) : (
        <Box style={{ gap: 10 }}>
          <Text preset="h1">{t('journey.title')}</Text>
          <Text preset="muted">{t('journey.subtitle')}</Text>

          <Segmented
            value={view}
            onChange={setView}
            testIDPrefix="seg-journey"
            options={[
              { key: "map", label: t("journey.tabs.map") },
              { key: "proof", label: t("journey.tabs.proof") },
            ]}
          />
        </Box>
      )}

      {view === "map" ? (
        <>
          {useModuleEnabled('module.journey.nextUp') ? (
            <JourneyNextUpModule
              progress={progress}
              mission={mission as any}
              onStartMission={(m) => startMission(m)}
              testID="journey.nextUp"
            />
          ) : (
            <Card tone="glow">
              <Text preset="h2">{t('journey.nextUpTitle')}</Text>
              <ProgressRow done={progress.done} total={progress.total} pct={progress.pct} />
              {!mission ? (
                <Text preset="muted">{t('journey.unlockMap')}</Text>
              ) : (
                <>
                  <Text preset="body" style={{ fontWeight: "900" }}>
                    {mission.title}
                  </Text>
                  <Text preset="muted">{mission.subtitle}</Text>
                  <Box style={{ marginTop: 10 }}>
                    <Button text={t('journey.startMission')} onPress={() => startMission(mission)} testID="btn-journey-start-mission" />
                  </Box>
                </>
              )}
            </Card>
          )}

          <JourneyMap nodes={journeyNodes} onStartMission={startMission} />
        </>
      ) : (
        <>
          <Card tone="glow">
            <Text preset="h2">{t('journey.weeklyReportTitle')}</Text>
            <Text preset="muted">{t('journey.weeklyReportSubtitle')}</Text>

            <Box
              collapsable={false}
              ref={(r: React.ElementRef<typeof Box> | null) => {
                weeklyCardRef.current = r
              }}
            >
              {weekly?.cardStats ? <WeeklyReportCard stats={weekly.cardStats} /> : <Text preset="muted">{t('common.loading')}</Text>}
            </Box>

            <Box style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              <Button text={t('journey.shareWeekly')} onPress={shareWeekly} testID="btn-journey-share-weekly" />
              <Button text={t('journey.exportCsv')} variant="soft" onPress={exportCsv} testID="btn-journey-export-csv" />
            </Box>

            {shareToast ? (
              <Box style={{ marginTop: 10, alignItems: "center" }}>
                <Text preset="muted">{shareToast}</Text>
              </Box>
            ) : null}
          </Card>

          <Card>
            <Text preset="h2">{t('journey.quickInsightsTitle')}</Text>
            <Text preset="muted">{t('journey.quickInsightsSubtitle')}</Text>
            <Text preset="muted">{t('journey.wobble', { value: typeof profile?.wobbleCents === 'number' ? formatNumber(profile.wobbleCents, { maximumFractionDigits: 1, minimumFractionDigits: 1 }) : '—' })}</Text>
            <Text preset="muted">{t('journey.bias', { value: typeof profile?.biasCents === 'number' ? formatNumber(profile.biasCents, { maximumFractionDigits: 1, minimumFractionDigits: 1 }) : '—' })}</Text>
            <Text preset="muted">{t('journey.voicedRatio', { value: profile?.voicedRatio != null ? Math.round(profile.voicedRatio * 100) + '%' : '—' })}</Text>
          </Card>

          <Card>
            <Text preset="h2">{t('journey.recentTitle')}</Text>
            <RecentAttempts />
          </Card>
        </>
      )}

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} testID="btn-journey-back" />
    </Screen>
  )
}

function ProgressRow({ done, total, pct }: { done: number; total: number; pct: number }) {
  const theme = useTheme()
  return (
    <Box style={{ gap: 6, marginTop: 6 }}>
      <Box style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text preset="muted">{t('journey.phase1')}</Text>
        <Text preset="muted" style={{ fontWeight: "900" }}>
          {done}/{total}
        </Text>
      </Box>
      <Box style={{ height: 10, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.10)", overflow: "hidden" }}>
        <LinearGradient
          colors={theme.gradients.primary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 10, width: `${Math.max(6, Math.round(pct * 100))}%` }}
        />
      </Box>
    </Box>
  )
}

function RecentAttempts() {
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    listRecentAttempts(10)
      .then(setRows)
      .catch(() => {})
  }, [])

  if (!rows.length) return <Text preset="muted">{t('journey.noAttempts')}</Text>

  return (
    <Box style={{ gap: 8 }}>
      {rows.map((r) => (
        <Text key={r.id} preset="muted">
          {new Date(r.createdAt).toLocaleDateString()} • {r.drillId} • {Math.round(r.score)}
        </Text>
      ))}
    </Box>
  )
}
