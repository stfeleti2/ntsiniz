import React from "react"
import { StyleSheet } from 'react-native'
import { LinearGradient } from "expo-linear-gradient"
import { Text } from "@/ui/components/Typography"
import { LineChart } from "@/ui/charts/LineChart"
import { PopIn } from "@/ui/components/PopIn"
import { SparkleBurst } from "@/ui/components/SparkleBurst"
import { Box } from '@/ui'
import { t } from '@/core/i18n'
import { useTheme } from '@/theme/useTheme'

export type DrillResultCardStats = {
  title: string
  subtitle: string
  score: number
  dateLabel: string
  badges: { emoji: string; text: string }[]
  kpis: { label: string; value: string }[]
  trend?: number[]
  deltaFromPrev?: number
}

export const DrillResultCard = React.forwardRef<React.ElementRef<typeof Box>, { stats: DrillResultCardStats; effectsEnabled?: boolean }>(function DrillResultCard(
  { stats, effectsEnabled = false },
  ref,
) {
  const theme = useTheme()
  const improved = typeof stats.deltaFromPrev === "number" && stats.deltaFromPrev > 0

  return (
    <Box ref={ref} style={[styles.card, { backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.16)" }]}> 
      <LinearGradient
        colors={theme.gradients.surface as any}
        style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={theme.gradients.glow as any}
        style={[StyleSheet.absoluteFill, { borderRadius: 22, opacity: 0.6 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Box style={styles.headerRow}>
        <Box style={{ flex: 1 }}>
          <Text preset="h2">{stats.title}</Text>
          <Text preset="muted">{stats.subtitle}</Text>
          <Text preset="muted">{stats.dateLabel}</Text>
        </Box>
        <Box style={[styles.scorePill, { borderColor: "rgba(255,255,255,0.16)", backgroundColor: "rgba(10,12,18,0.55)" }]}>
          <Text preset="muted">{t('drillResultCard.score')}</Text>
          <Box style={{ position: "relative", alignItems: "center", justifyContent: "center" }}>
            <SparkleBurst enabled={effectsEnabled && improved} triggerKey={`${stats.dateLabel}-${stats.score}`} />
            <Text preset="h1">{String(Math.round(stats.score))}</Text>
          </Box>
        </Box>
      </Box>

      {stats.badges?.length ? (
        <Box style={styles.badgesWrap}>
          {stats.badges.slice(0, 6).map((b, i) => (
            <PopIn key={i} enabled={effectsEnabled} delayMs={i * 90}>
              <Box style={[styles.badge, { borderColor: "rgba(255,255,255,0.14)", backgroundColor: badgeTint(b.emoji) }]}> 
                <Text>{b.emoji}</Text>
                <Text preset="muted">{b.text}</Text>
              </Box>
            </PopIn>
          ))}
        </Box>
      ) : null}

      <Box style={styles.kpis}>
        {stats.kpis.slice(0, 6).map((k, i) => (
          <Box key={i} style={styles.kpi}>
            <Text preset="muted">{k.label}</Text>
            <Text preset="h2">{k.value}</Text>
          </Box>
        ))}
      </Box>

      {stats.trend && stats.trend.length >= 2 ? (
        <Box style={{ marginTop: 2 }}>
          <Text preset="muted">{t('drillResultCard.lastAttempts')}</Text>
          <LineChart values={stats.trend} height={95} showDots={false} />
        </Box>
      ) : null}

      <Box style={styles.footer}>
        <Text preset="muted">{t('weeklyReport.footer')}</Text>
      </Box>
    </Box>
  )
})

function badgeTint(emoji: string) {
  if (emoji === "🏆") return "rgba(255, 197, 66, 0.16)"
  if (emoji === "🎯") return "rgba(124, 92, 255, 0.18)"
  if (emoji === "🧘") return "rgba(46, 229, 157, 0.14)"
  if (emoji === "⚡") return "rgba(0, 229, 255, 0.14)"
  if (emoji === "🪄") return "rgba(255, 61, 206, 0.16)"
  return "rgba(10,12,18,0.38)"
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
    width: 92,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  badgesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  kpis: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  kpi: { width: "48%", gap: 2 },
  footer: { marginTop: 2 },
})
