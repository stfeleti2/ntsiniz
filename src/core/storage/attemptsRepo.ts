import { getDb, exec, query } from "./db"
import { id } from "../util/id"
import { upsertBestTakeForAttempt } from "./bestTakesRepo"

export type Attempt = {
  id: string
  createdAt: number
  sessionId: string
  drillId: string
  score: number
  metrics: any
}

export async function addAttempt(input: Omit<Attempt, "id" | "createdAt"> & { metrics: any }) {
  const d = await getDb()
  const a: Attempt = {
    id: id("att"),
    createdAt: Date.now(),
    sessionId: input.sessionId,
    drillId: input.drillId,
    score: input.score,
    metrics: input.metrics,
  }
  await exec(d, `INSERT INTO attempts (id, createdAt, sessionId, drillId, score, metrics, durationMs, avgConfidence, framesAnalyzed, strictness, deviceClass) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, [
    a.id,
    a.createdAt,
    a.sessionId,
    a.drillId,
    a.score,
    JSON.stringify(a.metrics ?? {}),
    a.metrics?.durationMs != null || a.metrics?.duration != null ? Number(a.metrics?.durationMs ?? a.metrics?.duration) : null,
    typeof a.metrics?.avgConfidence === 'number' ? a.metrics.avgConfidence : null,
    typeof a.metrics?.framesAnalyzed === 'number' ? a.metrics.framesAnalyzed : null,
    typeof a.metrics?.strictness === 'number' ? a.metrics.strictness : null,
    typeof a.metrics?.deviceClass === 'string' ? a.metrics.deviceClass : null,
  ])
  return a
}

/**
 * Adds an attempt and best-take mapping (best-effort).
 *
 * Why: DrillScreen previously swallowed best-take errors, which could silently
 * break "best take" UX and progress proof. This keeps attempt persistence
 * reliable while making best-take correctness observable.
 */
export async function addAttemptAndUpdateBestTake(input: Omit<Attempt, "id" | "createdAt"> & { metrics: any }) {
  const attempt = await addAttempt(input)
  // Best-take is not critical-path for attempt persistence.
  // If it fails, callers should log/capture the error.
  const bestTake = await upsertBestTakeForAttempt({
    sessionId: attempt.sessionId,
    drillId: attempt.drillId,
    attemptId: attempt.id,
    score: attempt.score,
  })
  return { attempt, bestTake }
}

export async function listAttemptsBySession(sessionId: string): Promise<Attempt[]> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM attempts WHERE sessionId = ? ORDER BY createdAt ASC;`, [sessionId])
  return rows.map((r) => ({ ...r, metrics: safeParse(r.metrics) }))
}

export async function getAttemptById(attemptId: string): Promise<Attempt | null> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM attempts WHERE id = ? LIMIT 1;`, [attemptId])
  if (!rows[0]) return null
  const r = rows[0]
  return { ...r, metrics: safeParse(r.metrics) }
}

export async function listAttemptsByDrill(drillId: string, limit = 50): Promise<Attempt[]> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM attempts WHERE drillId = ? ORDER BY createdAt DESC LIMIT ?;`, [drillId, limit])
  return rows.map((r) => ({ ...r, metrics: safeParse(r.metrics) }))
}

export async function listRecentAttempts(limit = 200): Promise<Attempt[]> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM attempts ORDER BY createdAt DESC LIMIT ?;`, [limit])
  return rows.map((r) => ({ ...r, metrics: safeParse(r.metrics) }))
}

export async function listAttemptsInRange(startMs: number, endMs: number): Promise<Attempt[]> {
  const d = await getDb()
  const rows = await query<any>(
    d,
    `SELECT * FROM attempts WHERE createdAt >= ? AND createdAt < ? ORDER BY createdAt ASC;`,
    [startMs, endMs],
  )
  return rows.map((r) => ({ ...r, metrics: safeParse(r.metrics) }))
}

function safeParse(v: any) {
  try {
    return typeof v === "string" ? JSON.parse(v) : v
  } catch {
    return {}
  }
}
