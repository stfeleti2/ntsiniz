export function msUntilTomorrow(now = Date.now()) {
  const d = new Date(now)
  // Setting hours to 24 advances to tomorrow 00:00:00.000 in local time.
  d.setHours(24, 0, 0, 0)
  return Math.max(0, d.getTime() - now)
}

export function formatCountdown(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  // Keep it compact: 05:12:09 or 00:45:10
  const hh = String(h).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}
