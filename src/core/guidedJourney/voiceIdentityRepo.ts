import { getDb, exec, query } from '@/core/storage/db'
import type { VoiceIdentitySnapshot } from './types'

export const DEFAULT_VOICE_IDENTITY: VoiceIdentitySnapshot = {
  updatedAt: 0,
  coachingMode: 'starter',
  onboardingIntent: 'justExplore',
  firstWinComplete: false,
  firstWinVersion: 0,
  firstWinSnapshot: null,
  strengths: [],
  currentFocus: [],
  comfortZone: { lowMidi: null, highMidi: null },
  likelyFamily: { label: null, confidence: 0 },
}

export async function getVoiceIdentity(): Promise<VoiceIdentitySnapshot> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM settings WHERE id = 'voiceIdentity' LIMIT 1;`)
  if (!rows[0]) return DEFAULT_VOICE_IDENTITY
  return safeParseMerge(rows[0].data, DEFAULT_VOICE_IDENTITY)
}

export async function upsertVoiceIdentity(next: VoiceIdentitySnapshot) {
  const d = await getDb()
  await exec(
    d,
    `INSERT INTO settings (id, data) VALUES ('voiceIdentity', ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data;`,
    [JSON.stringify(next)],
  )
}

function safeParseMerge<T extends Record<string, any>>(value: unknown, fallback: T): T {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!parsed || typeof parsed !== 'object') return fallback
    return { ...fallback, ...parsed }
  } catch {
    return fallback
  }
}
