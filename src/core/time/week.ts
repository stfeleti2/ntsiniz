// ISO week helpers (used by weekly challenges / leaderboards)

export function getIsoWeekKey(now = Date.now()): string {
  const d = new Date(now)
  // Copy date, use UTC to avoid TZ edge cases
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  // Thursday in current week decides the year.
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  const year = date.getUTCFullYear()
  return `${year}-W${String(weekNo).padStart(2, '0')}`
}

export function getWeekStartMs(now = Date.now()): number {
  const d = new Date(now)
  // Monday 00:00 local
  const day = d.getDay() // 0..6 (Sun..Sat)
  const diff = (day + 6) % 7 // days since Monday
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  start.setDate(start.getDate() - diff)
  start.setHours(0, 0, 0, 0)
  return start.getTime()
}

export function getWeekEndMs(now = Date.now()): number {
  return getWeekStartMs(now) + 7 * 86400000
}
