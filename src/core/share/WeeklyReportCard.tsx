import React from "react"
import { StyleSheet } from 'react-native'
import { LinearGradient } from "expo-linear-gradient"
import { Text } from "@/ui/components/Typography"
import { useTheme } from "@/theme/useTheme"
import { LineChart } from "@/ui/charts/LineChart"

import type { WeeklyReportCardStats } from "./weeklyReportTypes"
import { Box } from '@/ui'
import { t } from '@/core/i18n'

export const WeeklyReportCard = React.forwardRef<React.ElementRef<typeof Box>, { stats: WeeklyReportCardStats }>(function WeeklyReportCard(
  { stats },
  ref,
) {
  const theme = useTheme()
  const delta = stats.vsPrevWeekDelta
  const deltaText = typeof delta === "number" ? `${delta > 0 ? "+" : ""}${delta}` : "—"
  const headlineScore = stats.avgScore == null ? "—" : String(Math.round(stats.avgScore))
  const minutesText = stats.minutesTrained == null ? "—" : `${stats.minutesTrained} min`
  const streakText = stats.bestStreakDays >= 2 ? `${stats.bestStreakDays}d` : "—"

  return (
    <Box
      ref={ref}
      style={[
        styles.card,
        {
          backgroundColor: "transparent",
          borderColor: "rgba(255,255,255,0.16)",
        },
      ]}
    >
      <LinearGradient
        colors={theme.gradients.surface as any}
        style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={theme.gradients.glow as any}
        style={[StyleSheet.absoluteFill, { borderRadius: 22, opacity: 0.65 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Box style={styles.headerRow}>
        <Box style={{ flex: 1 }}>
          <Text preset="h2">{t('weeklyReport.title')}</Text>
          <Text preset="muted">{stats.weekLabel}</Text>
          {stats.insight ? <Text preset="muted">{stats.insight}</Text> : null}
        </Box>
        <Box style={[styles.scorePill, { borderColor: "rgba(255,255,255,0.16)", backgroundColor: "rgba(10,12,18,0.55)" }]}>
          <Text preset="muted">{t('weeklyReport.avg')}</Text>
          <Text preset="h1">{headlineScore}</Text>
        </Box>
      </Box>

      <Box style={styles.kpis}>
        <Kpi label={t('weeklyReport.kpi.sessions')} value={String(stats.sessions)} />
        <Kpi label={t('weeklyReport.kpi.activeDays')} value={String(stats.activeDays)} />
        <Kpi label={t('weeklyReport.kpi.minutes')} value={minutesText} />
        <Kpi label={t('weeklyReport.kpi.streak')} value={streakText} />
        <Kpi label={t('weeklyReport.kpi.vsLastWeek')} value={deltaText} />
        <Kpi label={t('weeklyReport.kpi.best')} value={stats.bestScore == null ? "—" : String(stats.bestScore)} />
      </Box>

      {stats.badges.length ? (
        <Box style={styles.badgesWrap}>
          {stats.badges.slice(0, 6).map((b, i) => (
            <BadgeChip key={i} emoji={b.emoji} text={b.text} />
          ))}
        </Box>
      ) : null}

      {stats.topDrills?.length ? (
        <Box style={styles.badgesWrap}>
          {stats.topDrills.slice(0, 3).map((d, i) => (
            <Box key={i} style={[styles.badge, { borderColor: "rgba(255,255,255,0.14)", backgroundColor: "rgba(10,12,18,0.38)" }]}>
              <Text preset="muted">{d.text}</Text>
            </Box>
          ))}
        </Box>
      ) : null}

      {stats.dailyAverages.length >= 2 ? (
        <Box style={{ marginTop: 4 }}>
          <Text preset="muted">{t('weeklyReport.dailyTrend')}</Text>
          <LineChart values={stats.dailyAverages} height={110} showDots={false} />
        </Box>
      ) : null}

      <Box style={styles.footer}>
        <Text preset="muted">{t('weeklyReport.footer')}</Text>
      </Box>
    </Box>
  )
})

function BadgeChip({ emoji, text }: { emoji: string; text: string }) {
  const tint = badgeTint(emoji)
  return (
    <Box
      style={[
        styles.badge,
        {
          borderColor: "rgba(255,255,255,0.14)",
          backgroundColor: tint,
        },
      ]}
    >
      <Text>{emoji}</Text>
      <Text preset="muted">{text}</Text>
    </Box>
  )
}

function badgeTint(emoji: string) {
  // lightweight “sticker” feel for Stories
  if (emoji === "🔥") return "rgba(255, 92, 92, 0.16)"
  if (emoji === "🚀") return "rgba(255, 61, 206, 0.16)"
  if (emoji === "🧘") return "rgba(46, 229, 157, 0.14)"
  if (emoji === "🎯") return "rgba(124, 92, 255, 0.18)"
  if (emoji === "⚡") return "rgba(255, 197, 66, 0.16)"
  if (emoji === "🎤") return "rgba(0, 229, 255, 0.14)"
  return "rgba(10,12,18,0.38)"
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Box style={styles.kpi}>
      <Text preset="muted">{label}</Text>
      <Text preset="h2">{value}</Text>
    </Box>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 360,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    gap: 12,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  scorePill: {
    width: 86,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  kpis: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kpi: {
    width: "48%",
    gap: 2,
  },
  badgesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  footer: { marginTop: 2, gap: 6 },
})
