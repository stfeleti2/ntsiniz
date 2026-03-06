import { getDb, exec, query } from './db'

/**
 * Lightweight, schema-free user state.
 * Stored in the existing `settings` table (id-scoped JSON blobs) to avoid DB migrations.
 */
export type UserState = {
  // Curriculum progression
  curriculum?: {
    /** 0-based index of the next day to do */
    dayIndex: number
    /** Day keys (start-of-day ms) that were completed */
    completedDayKeys: number[]
  }

  // Streak protection (one shield per 7 days)
  streakShield?: {
    usedDayKeys: number[]
    lastUsedAt?: number
  }

  // Daily challenge best scores (keyed by YYYY-MM-DD)
  dailyChallenge?: {
    bestByDate: Record<string, number>
  }
}

export const DEFAULT_USER_STATE: UserState = {
  curriculum: { dayIndex: 0, completedDayKeys: [] },
  streakShield: { usedDayKeys: [] },
  dailyChallenge: { bestByDate: {} },
}

export async function getUserState(): Promise<UserState> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM settings WHERE id = 'userState' LIMIT 1;`)
  if (!rows[0]) return DEFAULT_USER_STATE
  return safeParseMerge(rows[0].data, DEFAULT_USER_STATE)
}

export async function upsertUserState(next: UserState) {
  const d = await getDb()
  await exec(
    d,
    `INSERT INTO settings (id, data) VALUES ('userState', ?) 
     ON CONFLICT(id) DO UPDATE SET data = excluded.data;`,
    [JSON.stringify(next)],
  )
}

function safeParseMerge<T extends Record<string, any>>(v: any, fallback: T): T {
  try {
    const obj = typeof v === 'string' ? JSON.parse(v) : v
    if (!obj || typeof obj !== 'object') return fallback
    return { ...fallback, ...obj }
  } catch {
    return fallback
  }
}
