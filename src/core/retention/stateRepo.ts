import { getDb, exec, query } from '@/core/storage/db'

export type RetentionState = {
  /** YYYY-MM-DD */
  dailyKey?: string
  daily?: {
    sharedWin?: boolean
  }
  /** YYYY-Www */
  weeklyKey?: string
  weekly?: {
    goalSessions?: number
  }
}

const DEFAULT_STATE: RetentionState = {
  dailyKey: undefined,
  daily: { sharedWin: false },
  weeklyKey: undefined,
  weekly: { goalSessions: 5 },
}

function safeParseMerge<T extends Record<string, any>>(v: any, fallback: T): T {
  try {
    const obj = typeof v === 'string' ? JSON.parse(v) : v
    if (!obj || typeof obj !== 'object') return fallback
    return { ...fallback, ...obj, daily: { ...fallback.daily, ...(obj.daily ?? {}) }, weekly: { ...fallback.weekly, ...(obj.weekly ?? {}) } }
  } catch {
    return fallback
  }
}

export async function getRetentionState(): Promise<RetentionState> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM retention_state WHERE id = 'default' LIMIT 1;`)
  if (!rows[0]) return DEFAULT_STATE
  return safeParseMerge(rows[0].data, DEFAULT_STATE)
}

export async function upsertRetentionState(s: RetentionState) {
  const d = await getDb()
  await exec(
    d,
    `INSERT INTO retention_state (id, data) VALUES ('default', ?) 
     ON CONFLICT(id) DO UPDATE SET data = excluded.data;`,
    [JSON.stringify(s)],
  )
}

export async function markSharedWinForDay(dayKey: string) {
  const s = await getRetentionState()
  // reset daily flags if day changed
  if (s.dailyKey !== dayKey) {
    s.dailyKey = dayKey
    s.daily = { sharedWin: false }
  }
  s.daily = { ...(s.daily ?? {}), sharedWin: true }
  await upsertRetentionState(s)
}

export async function setWeeklyGoalSessions(goal: number) {
  const s = await getRetentionState()
  s.weekly = { ...(s.weekly ?? {}), goalSessions: Math.max(1, Math.min(14, Math.round(goal))) }
  await upsertRetentionState(s)
}
