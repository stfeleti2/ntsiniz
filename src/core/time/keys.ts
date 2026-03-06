/** Returns YYYY-MM-DD in the user's local timezone. */
export function dayKey(ms: number): string {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Returns ms at local start-of-day. */
export function startOfDayMs(ms: number): number {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** ISO week key: YYYY-Www */
export function weekKey(ms: number): string {
  const d = new Date(ms)
  // ISO week date algorithm
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  const yyyy = date.getUTCFullYear()
  return `${yyyy}-W${String(weekNo).padStart(2, '0')}`
}

export function weekRangeMs(ms: number): { startMs: number; endMs: number } {
  // Monday start (ISO)
  const d = new Date(ms)
  const day = d.getDay() || 7
  const start = new Date(d)
  start.setDate(d.getDate() - (day - 1))
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  return { startMs: start.getTime(), endMs: end.getTime() }
}
