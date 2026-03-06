type DbModule = {
  getDb: () => Promise<any>
  exec: (db: any, sql: string, params?: any[]) => Promise<any>
  query: <T = any>(db: any, sql: string, params?: any[]) => Promise<T[]>
}

let _dbModule: DbModule | null = null

function getDbModule(): DbModule {
  if (!_dbModule) {
    // Lazily load DB bindings so pure helpers (e.g. computeBackoffMs) remain node-test friendly.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _dbModule = require('../storage/db') as DbModule
  }
  return _dbModule
}

function makeOpId(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('../util/id') as { id: (prefix?: string) => string }
  return mod.id('op')
}

export type SyncOp = {
  id: string
  createdAt: number
  tries: number
  nextAttemptAt?: number | null
  lastError?: string | null
  kind: string
  entityId: string
  action: 'upsert' | 'hide' | 'delete'
  payload: any
  updatedAt: number
}

function rowToOp(r: any): SyncOp {
  return {
    id: r.id,
    createdAt: r.createdAt,
    tries: r.tries ?? 0,
    nextAttemptAt: r.nextAttemptAt ?? null,
    lastError: r.lastError ?? null,
    kind: r.kind,
    entityId: r.entityId,
    action: r.action,
    payload: safeParse(r.payload),
    updatedAt: r.updatedAt,
  }
}

function safeParse(v: any) {
  try {
    return typeof v === 'string' ? JSON.parse(v) : v
  } catch {
    return {}
  }
}

export async function enqueueSyncOp(
  input: Omit<SyncOp, 'id' | 'createdAt' | 'tries'> & { id?: string; createdAt?: number },
): Promise<void> {
  const { getDb, exec, query } = getDbModule()
  const d = await getDb()
  const now = input.createdAt ?? Date.now()
  const opId = input.id ?? makeOpId()

  // Compaction: keep only the latest op per (kind, entityId, action).
  // This prevents unbounded queue growth for repetitive upserts.
  await exec(d, `DELETE FROM sync_queue WHERE kind = ? AND entityId = ? AND action = ?;`, [input.kind, input.entityId, input.action]).catch(() => {})

  await exec(
    d,
    `INSERT INTO sync_queue (id, createdAt, tries, nextAttemptAt, lastError, kind, entityId, action, payload, updatedAt)
     VALUES (?, ?, 0, ?, NULL, ?, ?, ?, ?, ?);`,
    [opId, now, now, input.kind, input.entityId, input.action, JSON.stringify(input.payload ?? null), now],
  )

  // Hard cap: keep at most N ops; drop oldest beyond cap.
  const CAP = 1000
  const rows = await query<any>(d, `SELECT id FROM sync_queue ORDER BY createdAt DESC;`, [])
  if (rows.length > CAP) {
    const toDrop = rows.slice(CAP).map((r: any) => r.id)
    // SQLite has a 999 bind-parameter limit; chunk deletes.
    for (let i = 0; i < toDrop.length; i += 500) {
      const chunk = toDrop.slice(i, i + 500)
      const qs = chunk.map(() => '?').join(',')
      await exec(d, `DELETE FROM sync_queue WHERE id IN (${qs});`, chunk)
    }
  }
}


export async function listSyncQueue(limit = 50): Promise<SyncOp[]> {
  const { getDb, query } = getDbModule()
  const d = await getDb()
  const now = Date.now()
  const rows = await query<any>(
    d,
    `SELECT * FROM sync_queue WHERE (nextAttemptAt IS NULL OR nextAttemptAt <= ?) ORDER BY createdAt ASC LIMIT ?;`,
    [now, limit],
  )
  return rows.map(rowToOp)
}

export async function deleteSyncOp(id: string): Promise<void> {
  const { getDb, exec } = getDbModule()
  const d = await getDb()
  await exec(d, `DELETE FROM sync_queue WHERE id = ?;`, [id])
}

export async function bumpSyncOpTry(id: string): Promise<void> {
  const { getDb, exec } = getDbModule()
  const d = await getDb()
  await exec(d, `UPDATE sync_queue SET tries = tries + 1 WHERE id = ?;`, [id])
}

export const MAX_SYNC_TRIES = 8

export function computeBackoffMs(tries: number): number {
  // Exponential backoff with cap (max ~ 10 min) + small jitter.
  const base = Math.min(10 * 60_000, Math.pow(2, Math.max(0, tries)) * 1_000)
  const jitter = Math.floor(Math.random() * 400)
  return base + jitter
}

/**
 * Records a failed attempt and schedules a retry. If the op exceeds MAX_TRIES,
 * it is moved to sync_deadletter to avoid infinite loops.
 */
export async function recordSyncOpFailure(id: string, error: string | undefined): Promise<void> {
  const { getDb, exec, query } = getDbModule()
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM sync_queue WHERE id = ? LIMIT 1;`, [id])
  const r = rows[0]
  if (!r) return

  const tries = Number(r.tries ?? 0) + 1
  const next = Date.now() + computeBackoffMs(tries)
  const msg = (error ?? 'Unknown error').slice(0, 240)

  if (tries >= MAX_SYNC_TRIES) {
    await exec(
      d,
      `INSERT OR REPLACE INTO sync_deadletter (id, createdAt, kind, entityId, action, payload, updatedAt, lastError)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [r.id, r.createdAt, r.kind, r.entityId, r.action, r.payload, r.updatedAt, msg],
    )
    await exec(d, `DELETE FROM sync_queue WHERE id = ?;`, [id])
    return
  }

  await exec(
    d,
    `UPDATE sync_queue SET tries = ?, nextAttemptAt = ?, lastError = ? WHERE id = ?;`,
    [tries, next, msg, id],
  )
}

export async function getSyncQueueSize(): Promise<number> {
  const { getDb, query } = getDbModule()
  const d = await getDb()
  const rows = await query<any>(d, `SELECT COUNT(1) AS c FROM sync_queue;`, [])
  return Number(rows[0]?.c ?? 0)
}


export async function moveSyncOpToDeadletter(id: string, reason: string): Promise<void> {
  const { getDb, exec, query } = getDbModule()
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM sync_queue WHERE id = ? LIMIT 1;`, [id])
  const r = rows[0]
  if (!r) return
  const msg = (reason ?? 'Moved to deadletter').slice(0, 240)
  await exec(
    d,
    `INSERT INTO sync_deadletter (id, createdAt, kind, entityId, action, payload, updatedAt, lastError)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [r.id, r.createdAt, r.kind, r.entityId, r.action, r.payload, Date.now(), msg],
  )
  await exec(d, `DELETE FROM sync_queue WHERE id = ?;`, [id])
}
