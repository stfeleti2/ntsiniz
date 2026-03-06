import { computeHeatmapDays } from './heatmap'

export function startOfDay(ts: number) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function toDayKey(ts: number) {
  return startOfDay(ts)
}

export function computeCurrentStreak(days: { dayMs: number; sessions: number }[], shieldedDayKeys: number[] = []) {
  const sorted = [...days].sort((a, b) => a.dayMs - b.dayMs)
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

export function computeStreakFromAggregates(
  aggs: { startedAt: number; avgScore: number; attemptCount: number }[],
  shieldedDayKeys: number[] = [],
) {
  const normalized = aggs.map((a, i) => ({ id: `agg_${i}`, ...a }))
  const hm = computeHeatmapDays({ aggs: normalized, endMs: Date.now(), days: 30 })
  return computeCurrentStreak(hm, shieldedDayKeys)
}
