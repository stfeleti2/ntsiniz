import React from "react"
import { StyleSheet } from 'react-native'
import { Text } from "@/ui/components/Typography"
import { useTheme } from "@/theme/useTheme"
import { Box } from '@/ui/primitives'
import { t } from '@/core/i18n'

export type ProgressCardStats = {
  label: string
  scoreNow: number
  scoreThen?: number
  delta?: number
  streakDays?: number
}

export const ProgressCard = React.forwardRef<React.ElementRef<typeof Box>, { stats: ProgressCardStats }>(function ProgressCard({ stats }, ref) {
  const theme = useTheme()
  return (
    <Box
      ref={ref}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.line,
        },
      ]}
    >
      <Text preset="h2">{t('progressCard.title')}</Text>
      <Text preset="muted">{stats.label}</Text>

      <Box style={styles.row}>
        <Box style={styles.block}>
          <Text preset="muted">{t('progressCard.score')}</Text>
          <Text preset="h1">{stats.scoreNow}</Text>
        </Box>
        <Box style={styles.block}>
          <Text preset="muted">{t('progressCard.change')}</Text>
          <Text preset="h1">{typeof stats.delta === "number" ? `${stats.delta > 0 ? "+" : ""}${stats.delta}` : "—"}</Text>
        </Box>
      </Box>

      <Box style={styles.footer}>
        <Text preset="muted">{t('progressCard.footer')}</Text>
      </Box>
    </Box>
  )
})

const styles = StyleSheet.create({
  card: {
    width: 320,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    gap: 12,
  },
  row: { flexDirection: "row", gap: 12 },
  block: { flex: 1, gap: 4 },
  footer: { marginTop: 6 },
})
