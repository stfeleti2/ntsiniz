import { getDb, exec, query } from '../storage/db'
import type { JourneyRouteId } from './types'
import {
  adaptiveReducer,
  DEFAULT_ADAPTIVE_STATE,
  inferDiagnosisTags,
  chooseNextFamily,
  shouldEnableHelpMode,
  type AdaptiveAttemptMetrics,
  type AdaptiveState,
  type DiagnosisTag,
} from './adaptiveCore'

export { adaptiveReducer, DEFAULT_ADAPTIVE_STATE, inferDiagnosisTags, chooseNextFamily, shouldEnableHelpMode }
export type { AdaptiveAttemptMetrics, AdaptiveState, DiagnosisTag }

export async function getAdaptiveJourneyState(): Promise<AdaptiveState> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM settings WHERE id = 'guidedJourneyAdaptive' LIMIT 1;`)
  if (!rows[0]) return DEFAULT_ADAPTIVE_STATE
  return safeParseMerge(rows[0].data, DEFAULT_ADAPTIVE_STATE)
}

export async function upsertAdaptiveJourneyState(next: AdaptiveState) {
  const d = await getDb()
  await exec(
    d,
    `INSERT INTO settings (id, data) VALUES ('guidedJourneyAdaptive', ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data;`,
    [JSON.stringify(next)],
  )
}

export async function recordAdaptiveAttempt(payload: AdaptiveAttemptMetrics, routeOverride?: JourneyRouteId) {
  const current = await getAdaptiveJourneyState()
  const seeded = routeOverride && current.routeId !== routeOverride ? { ...current, routeId: routeOverride } : current
  const next = adaptiveReducer(seeded, { type: 'ATTEMPT_RECORDED', payload })
  await upsertAdaptiveJourneyState(next)
  return next
}

function safeParseMerge<T extends Record<string, any>>(value: unknown, fallback: T): T {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!parsed || typeof parsed !== 'object') return fallback
    return {
      ...fallback,
      ...parsed,
      voiceProfile: {
        ...(fallback as any).voiceProfile,
        ...((parsed as any).voiceProfile ?? {}),
      },
      recentAttempts: Array.isArray((parsed as any).recentAttempts) ? (parsed as any).recentAttempts : fallback.recentAttempts,
    }
  } catch {
    return fallback
  }
}
