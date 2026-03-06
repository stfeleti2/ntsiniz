import { getDb, exec, query } from "./db"

export type VoiceProfile = {
  updatedAt: number
  biasCents: number // + sharp, - flat
  driftCentsPerSec: number
  wobbleCents: number
  overshootRate: number
  voicedRatio: number
  confidence: number // 0..1
}

export const DEFAULT_PROFILE: VoiceProfile = {
  updatedAt: 0,
  biasCents: 0,
  driftCentsPerSec: 0,
  wobbleCents: 0,
  overshootRate: 0,
  voicedRatio: 0,
  confidence: 0,
}

export async function getProfile(): Promise<VoiceProfile> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM profile WHERE id = 'default' LIMIT 1;`)
  if (!rows[0]) return DEFAULT_PROFILE
  return safeParse(rows[0].data, DEFAULT_PROFILE)
}

export async function upsertProfile(p: VoiceProfile) {
  const d = await getDb()
  await exec(
    d,
    `INSERT INTO profile (id, updatedAt, data) VALUES ('default', ?, ?) 
     ON CONFLICT(id) DO UPDATE SET updatedAt = excluded.updatedAt, data = excluded.data;`,
    [p.updatedAt, JSON.stringify(p)],
  )
}

function safeParse<T>(v: any, fallback: T): T {
  try {
    return typeof v === "string" ? (JSON.parse(v) as T) : (v as T)
  } catch {
    return fallback
  }
}
