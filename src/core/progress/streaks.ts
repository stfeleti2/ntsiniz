import type { SessionAggregate } from "./types"

export function startOfDayMs(ts: number) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function computeStreaksFromDayList(dayMsSorted: number[]) {
  const day = 24 * 60 * 60 * 1000
  if (!dayMsSorted.length) return { bestStreakDays: 0, currentStreakDays: 0 }
  let best = 1
  let cur = 1
  for (let i = 1; i < dayMsSorted.length; i++) {
    if (dayMsSorted[i] === dayMsSorted[i - 1] + day) cur += 1
    else cur = 1
    if (cur > best) best = cur
  }
  return { bestStreakDays: best, currentStreakDays: cur }
}

export function streaksFromAggregates(aggs: SessionAggregate[]) {
  const set = new Set<number>()
  for (const s of aggs) set.add(startOfDayMs(s.startedAt))
  const days = Array.from(set).sort((a, b) => a - b)
  return { days, ...computeStreaksFromDayList(days) }
}
