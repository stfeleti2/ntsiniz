import { getDb, exec, query } from "./db"
import { id } from "../util/id"

export type Session = {
  id: string
  startedAt: number
  endedAt?: number | null
  tip?: string | null
  summary?: string | null
}

export async function createSession() {
  const d = await getDb()
  const s: Session = { id: id("sess"), startedAt: Date.now(), endedAt: null, tip: null, summary: null }
  await exec(d, `INSERT INTO sessions (id, startedAt, endedAt, tip, summary) VALUES (?, ?, ?, ?, ?);`, [
    s.id,
    s.startedAt,
    s.endedAt,
    s.tip,
    s.summary,
  ])
  return s
}

export async function finishSession(sessionId: string, tip: string, summary: string) {
  const d = await getDb()
  const endedAt = Date.now()
  await exec(d, `UPDATE sessions SET endedAt = ?, tip = ?, summary = ? WHERE id = ?;`, [endedAt, tip, summary, sessionId])
}

export async function listSessions(limit = 30): Promise<Session[]> {
  const d = await getDb()
  return await query<Session>(d, `SELECT * FROM sessions ORDER BY startedAt DESC LIMIT ?;`, [limit])
}

export type SessionAggregateRow = {
  id: string
  startedAt: number
  endedAt?: number | null
  avgScore: number
  attemptCount: number
}

/**
 * Returns sessions (oldest -> newest) with average attempt score.
 * Designed for progress charts & milestone comparisons without N+1 queries.
 */
export async function listSessionAggregates(limit = 90): Promise<SessionAggregateRow[]> {
  const d = await getDb()
  const rows = await query<any>(
    d,
    `
      SELECT
        s.id as id,
        s.startedAt as startedAt,
        s.endedAt as endedAt,
        COALESCE(AVG(a.score), 0) as avgScore,
        COUNT(a.id) as attemptCount
      FROM sessions s
      LEFT JOIN attempts a ON a.sessionId = s.id
      GROUP BY s.id
      ORDER BY s.startedAt ASC
      LIMIT ?;
    `,
    [limit],
  )

  return rows.map((r: any) => ({
    id: String(r.id),
    startedAt: Number(r.startedAt),
    endedAt: r.endedAt == null ? null : Number(r.endedAt),
    avgScore: Number(r.avgScore),
    attemptCount: Number(r.attemptCount),
  }))
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const d = await getDb()
  const rows = await query<Session>(d, `SELECT * FROM sessions WHERE id = ? LIMIT 1;`, [sessionId])
  return rows[0] ?? null
}

export async function listSessionAggregatesInRange(startMs: number, endMs: number): Promise<SessionAggregateRow[]> {
  const d = await getDb()
  const rows = await query<any>(
    d,
    `
      SELECT
        s.id as id,
        s.startedAt as startedAt,
        s.endedAt as endedAt,
        COALESCE(AVG(a.score), 0) as avgScore,
        COUNT(a.id) as attemptCount
      FROM sessions s
      LEFT JOIN attempts a ON a.sessionId = s.id
      WHERE s.startedAt >= ? AND s.startedAt < ?
      GROUP BY s.id
      ORDER BY s.startedAt ASC;
    `,
    [startMs, endMs],
  )

  return rows.map((r: any) => ({
    id: String(r.id),
    startedAt: Number(r.startedAt),
    endedAt: r.endedAt == null ? null : Number(r.endedAt),
    avgScore: Number(r.avgScore),
    attemptCount: Number(r.attemptCount),
  }))
}
