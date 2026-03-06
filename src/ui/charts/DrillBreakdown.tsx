import React, { useMemo } from "react"
import { StyleSheet } from 'react-native'
import { useTheme } from "@/theme/useTheme"
import { Text } from "@/ui/components/Typography"
import { Box } from '@/ui'
import { t } from '@/app/i18n'

export type BreakdownRow = {
  label: string
  avgScore: number
  delta: number | null
  attempts: number
}

export function DrillBreakdown({ rows, maxRows = 5 }: { rows: BreakdownRow[]; maxRows?: number }) {
  const theme = useTheme()

  const top = useMemo(() => rows.slice(0, maxRows), [rows, maxRows])
  const maxScore = Math.max(1, ...top.map((r) => r.avgScore))

  if (!top.length) return <Text preset="muted">{t('drillBreakdown.empty')}</Text>

  return (
    <Box style={{ gap: 10 }}>
      {top.map((r) => {
        const w = Math.max(0.08, r.avgScore / maxScore)
        const deltaText = r.delta == null ? "" : ` ${r.delta > 0 ? "+" : ""}${r.delta}`

        return (
          <Box key={r.label} style={{ gap: 6 }}>
            <Box style={styles.rowHeader}>
              <Text preset="h2" style={{ flex: 1 }}>
                {r.label}
              </Text>
              <Text preset="muted">
                {r.avgScore}
                {deltaText}
              </Text>
            </Box>
            <Box style={[styles.track, { backgroundColor: theme.colors.line }]}>
              <Box
                style={{
                  width: `${Math.round(w * 100)}%`,
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: theme.colors.accent,
                }}
              />
            </Box>
            <Text preset="muted">{t('drillBreakdown.attempts', { count: r.attempts })}</Text>
          </Box>
        )
      })}
    </Box>
  )
}

const styles = StyleSheet.create({
  rowHeader: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 10 },
  track: { height: 10, borderRadius: 999, overflow: "hidden" },
})
