import type { SessionAggregate } from "./types"

export type HeatmapDay = {
  dayMs: number
  sessions: number
  minutes: number
  avgScore: number | null
}

function startOfDayMs(ts: number) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function addDaysMs(ts: number, days: number) {
  return ts + days * 24 * 60 * 60 * 1000
}

function avg(xs: number[]) {
  if (!xs.length) return 0
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

/**
 * Builds a simple calendar heatmap dataset.
 * - days: number of days back from endMs (inclusive)
 * - intensity signal: sessions + minutes
 */
export function computeHeatmapDays(params: { aggs: SessionAggregate[]; endMs: number; days: number }): HeatmapDay[] {
  const { aggs, endMs, days } = params
  const endDay = startOfDayMs(endMs)
  const startDay = addDaysMs(endDay, -(days - 1))

  const map = new Map<number, { sessions: number; minutes: number; scores: number[] }>()

  for (const s of aggs) {
    if (s.startedAt < startDay || s.startedAt > endDay + 24 * 60 * 60 * 1000) continue
    const day = startOfDayMs(s.startedAt)
    const cur = map.get(day) ?? { sessions: 0, minutes: 0, scores: [] }

    cur.sessions += 1
    const end = typeof s.endedAt === "number" ? s.endedAt : null
    if (end != null && Number.isFinite(end)) {
      const dur = Math.max(0, end - s.startedAt)
      cur.minutes += Math.round(dur / 60000)
    }

    cur.scores.push(s.avgScore)
    map.set(day, cur)
  }

  const out: HeatmapDay[] = []
  for (let d = startDay; d <= endDay; d = addDaysMs(d, 1)) {
    const v = map.get(d)
    out.push({
      dayMs: d,
      sessions: v?.sessions ?? 0,
      minutes: v?.minutes ?? 0,
      avgScore: v?.scores?.length ? Math.round(avg(v.scores)) : null,
    })
  }
  return out
}
