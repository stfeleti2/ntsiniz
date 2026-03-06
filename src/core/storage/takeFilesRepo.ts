import { getDb, exec, query, withTransaction } from './db'
import { id } from '@/core/util/id'

export type TakeFileStatus = 'saving' | 'saved' | 'indexed' | 'deleted'

export type TakeFileRow = {
  id: string
  createdAt: number
  updatedAt: number
  path: string
  tmpPath?: string | null
  status: TakeFileStatus
  attemptId?: string | null
  sessionId?: string | null
  drillId?: string | null
  meta?: any
}

export type UpsertTakeFileInput = {
  /** Optional ID. If omitted (or empty), a new id() will be generated. */
  id?: string | null
  path: string
  tmpPath?: string | null
  status: TakeFileStatus
  attemptId?: string | null
  sessionId?: string | null
  drillId?: string | null
  meta?: any
}

export async function upsertTakeFile(input: UpsertTakeFileInput) {
  const d = await getDb()
  const now = Date.now()
  // Treat empty string ids as "missing". (Passing id: '' previously caused PK collisions.)
  const safeId = input.id && String(input.id).length > 0 ? input.id : undefined
  const row: TakeFileRow = {
    id: safeId ?? id('take'),
    createdAt: now,
    updatedAt: now,
    path: input.path,
    tmpPath: input.tmpPath ?? null,
    status: input.status,
    attemptId: input.attemptId ?? null,
    sessionId: input.sessionId ?? null,
    drillId: input.drillId ?? null,
    meta: input.meta ?? {},
  }

  await exec(
    d,
    `INSERT INTO take_files (id, createdAt, updatedAt, path, tmpPath, status, attemptId, sessionId, drillId, metaJson)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(path) DO UPDATE SET
       updatedAt=excluded.updatedAt,
       tmpPath=excluded.tmpPath,
       status=excluded.status,
       attemptId=excluded.attemptId,
       sessionId=excluded.sessionId,
       drillId=excluded.drillId,
       metaJson=excluded.metaJson;`,
    [
      row.id,
      row.createdAt,
      row.updatedAt,
      row.path,
      row.tmpPath,
      row.status,
      row.attemptId,
      row.sessionId,
      row.drillId,
      JSON.stringify(row.meta ?? {}),
    ],
  )
  return row
}

export async function markTakeSaved(path: string, tmpPath?: string | null) {
  return await upsertTakeFile({ id: id('take'), path, tmpPath: tmpPath ?? null, status: 'saved' })
}

export async function markTakeIndexed(path: string, ctx: { attemptId: string; sessionId: string; drillId: string; meta?: any }) {
  return await upsertTakeFile({
    id: id('take'),
    path,
    tmpPath: null,
    status: 'indexed',
    attemptId: ctx.attemptId,
    sessionId: ctx.sessionId,
    drillId: ctx.drillId,
    meta: ctx.meta ?? {},
  })
}

export async function listUnindexedTakes(limit = 50): Promise<TakeFileRow[]> {
  const d = await getDb()
  const rows = await query<any>(
    d,
    `SELECT * FROM take_files WHERE status IN ('saved','saving') ORDER BY updatedAt DESC LIMIT ?;`,
    [limit],
  )
  return rows.map(mapRow)
}

export async function listOrphanSavedTakes(limit = 50): Promise<TakeFileRow[]> {
  const d = await getDb()
  const rows = await query<any>(
    d,
    `SELECT * FROM take_files WHERE status = 'saved' AND (attemptId IS NULL OR attemptId = '') ORDER BY updatedAt DESC LIMIT ?;`,
    [limit],
  )
  return rows.map(mapRow)
}

export async function reconcileTakeFilePaths(updates: { from: string; to: string }[]) {
  if (!updates.length) return
  const d = await getDb()
  await withTransaction(d, async () => {
    for (const u of updates) {
      await exec(d, `UPDATE take_files SET path = ?, tmpPath = NULL, updatedAt = ? WHERE path = ?;`, [u.to, Date.now(), u.from]).catch(
        () => {},
      )
    }
  })
}

function mapRow(r: any): TakeFileRow {
  return {
    ...r,
    meta: safeParse(r.metaJson),
  }
}

function safeParse(v: any) {
  try {
    return typeof v === 'string' ? JSON.parse(v) : v
  } catch {
    return {}
  }
}
