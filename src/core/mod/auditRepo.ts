import { getDb, exec, query } from '@/core/storage/db'
import { id as makeId } from '@/core/util/id'

export type AuditEntry = {
  id: string
  createdAt: number
  actorId: string
  actorName: string
  action: string
  targetKind: string
  targetId: string
  metaJson: string
}

function rowToAudit(r: any): AuditEntry {
  return {
    id: r.id,
    createdAt: r.createdAt,
    actorId: r.actorId,
    actorName: r.actorName,
    action: r.action,
    targetKind: r.targetKind,
    targetId: r.targetId,
    metaJson: r.metaJson ?? '{}',
  }
}

export async function addAuditEntry(input: Omit<AuditEntry, 'id' | 'createdAt' | 'metaJson'> & { metaJson?: string; meta?: any }): Promise<AuditEntry> {
  const d = await getDb()
  const now = Date.now()
  const a: AuditEntry = {
    id: makeId('aud'),
    createdAt: now,
    actorId: input.actorId,
    actorName: input.actorName,
    action: input.action,
    targetKind: input.targetKind,
    targetId: input.targetId,
    metaJson: input.metaJson ?? JSON.stringify(input.meta ?? {}),
  }
  await exec(
    d,
    `INSERT INTO audit_log (id, createdAt, actorId, actorName, action, targetKind, targetId, metaJson)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [a.id, a.createdAt, a.actorId, a.actorName, a.action, a.targetKind, a.targetId, a.metaJson],
  )
  return a
}

export async function listAudit(limit = 80): Promise<AuditEntry[]> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM audit_log ORDER BY createdAt DESC LIMIT ?;`, [limit])
  return rows.map(rowToAudit)
}
