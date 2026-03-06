import React, { useMemo } from "react"
import { StyleSheet } from 'react-native'
import { useTheme } from "@/theme/useTheme"
import { Text } from "@/ui/components/Typography"
import { Box } from '@/ui'
import { t } from '@/app/i18n'

export type HeatmapCell = {
  dayMs: number
  sessions: number
  minutes: number
}

function withAlpha(hex: string, alpha01: number) {
  const a = Math.max(0, Math.min(1, alpha01))
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

function startOfDayMs(ts: number) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function Heatmap({ days, columns = 7 }: { days: HeatmapCell[]; columns?: number }) {
  const theme = useTheme()

  const { maxSignal, cells } = useMemo(() => {
    const max = Math.max(1, ...days.map((d) => d.sessions * 2 + Math.min(60, d.minutes) / 10))
    const list = days.map((d) => {
      const signal = d.sessions * 2 + Math.min(60, d.minutes) / 10
      return { ...d, signal }
    })
    return { maxSignal: max, cells: list }
  }, [days])

  // pad to full rows for stable layout
  const padded = useMemo(() => {
    const total = Math.ceil(cells.length / columns) * columns
    const pad = total - cells.length
    if (pad <= 0) return cells
    const first = cells[0]
    const start = first ? startOfDayMs(first.dayMs) : startOfDayMs(Date.now())
    const empty = Array.from({ length: pad }, (_, i) => ({ dayMs: start - (pad - i) * 86400000, sessions: 0, minutes: 0, signal: 0 }))
    return [...empty, ...cells]
  }, [cells, columns])

  const rows = Math.ceil(padded.length / columns)

  const weekday = (ts: number) => new Date(ts).getDay() // 0 Sun
  const isStartOfWeek = (ts: number) => weekday(ts) === 1 // Monday

  return (
    <Box style={styles.wrap}>
      <Box style={styles.legendRow}>
        <Text preset="muted">{t('heatmap.less')}</Text>
        <Box style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          {[0.15, 0.35, 0.6, 0.9].map((a, idx) => (
            <Box
              key={`${a}-${idx}`}
              style={{
                width: 12,
                height: 12,
                borderRadius: 4,
                backgroundColor: withAlpha(theme.colors.accent, a),
                borderWidth: 1,
                borderColor: theme.colors.line,
              }}
            />
          ))}
        </Box>
        <Text preset="muted">{t('heatmap.more')}</Text>
      </Box>

      <Box style={[styles.grid, { borderColor: theme.colors.line, backgroundColor: theme.colors.bg }]}>
        {Array.from({ length: rows }).map((_, r) => (
          <Box key={r} style={styles.row}>
            {Array.from({ length: columns }).map((__, c) => {
              const idx = r * columns + c
              const cell = padded[idx]
              const alpha = cell.signal <= 0 ? 0.08 : 0.1 + 0.9 * (cell.signal / maxSignal)
              const monthMarker = isStartOfWeek(cell.dayMs)

              return (
                <Box
                  key={idx}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 4,
                    backgroundColor: withAlpha(theme.colors.accent, alpha),
                    borderWidth: 1,
                    borderColor: monthMarker ? theme.colors.warn : theme.colors.line,
                  }}
                />
              )
            })}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  legendRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  grid: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    gap: 6,
  },
  row: { flexDirection: "row", gap: 6 },
})
