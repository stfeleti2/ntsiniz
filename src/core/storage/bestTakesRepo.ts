import { exec, getDb, query } from './db'

export type BestTakeRow = {
  sessionId: string
  drillId: string
  attemptId: string
  score: number
  updatedAt: number
}

/**
 * Upserts the best-take for a given (sessionId, drillId).
 * Only replaces if the new score is >= the existing best score.
 *
 * Important: this is implemented as a single UPSERT with a WHERE clause
 * so it is race-safe (no read-then-write window).
 */
export async function upsertBestTakeForAttempt(input: {
  sessionId: string
  drillId: string
  attemptId: string
  score: number
}) {
  const d = await getDb()
  const row: BestTakeRow = {
    sessionId: input.sessionId,
    drillId: input.drillId,
    attemptId: input.attemptId,
    score: input.score,
    updatedAt: Date.now(),
  }

  await exec(
    d,
    `INSERT INTO best_takes (sessionId, drillId, attemptId, score, updatedAt)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(sessionId, drillId) DO UPDATE SET
       attemptId = excluded.attemptId,
       score = excluded.score,
       updatedAt = excluded.updatedAt
     WHERE excluded.score >= best_takes.score;`,
    [row.sessionId, row.drillId, row.attemptId, row.score, row.updatedAt],
  )

  // Return the current row (whether updated or not).
  const cur = await query<any>(d, `SELECT * FROM best_takes WHERE sessionId = ? AND drillId = ? LIMIT 1;`, [
    row.sessionId,
    row.drillId,
  ])
  return (cur?.[0] as BestTakeRow | undefined) ?? row
}

export async function getBestTakeAttemptId(sessionId: string, drillId: string): Promise<string | null> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT attemptId FROM best_takes WHERE sessionId = ? AND drillId = ? LIMIT 1;`, [
    sessionId,
    drillId,
  ])
  return rows[0]?.attemptId ? String(rows[0].attemptId) : null
}

/**
 * Explicitly marks an attempt as best take.
 * Used by manual "Save Best" controls in playback.
 */
export async function setBestTakeForAttempt(input: {
  sessionId: string
  drillId: string
  attemptId: string
  score: number
}) {
  const d = await getDb()
  await exec(
    d,
    `INSERT INTO best_takes (sessionId, drillId, attemptId, score, updatedAt)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(sessionId, drillId) DO UPDATE SET
       attemptId = excluded.attemptId,
       score = excluded.score,
       updatedAt = excluded.updatedAt;`,
    [input.sessionId, input.drillId, input.attemptId, input.score, Date.now()],
  )
}

/**
 * Returns mapping of drillId -> attemptId for a session.
 */
export async function listBestTakeAttemptIdsForSession(sessionId: string): Promise<Record<string, string>> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT drillId, attemptId FROM best_takes WHERE sessionId = ?;`, [sessionId])
  const out: Record<string, string> = {}
  for (const r of rows) {
    if (r?.drillId && r?.attemptId) out[String(r.drillId)] = String(r.attemptId)
  }
  return out
}
