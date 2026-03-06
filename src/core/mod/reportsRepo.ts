import { getDb, exec, query } from '@/core/storage/db'
import { id as makeId } from '@/core/util/id'

export type ReportEntityKind = 'post' | 'comment' | 'clip'

export type Report = {
  id: string
  createdAt: number
  updatedAt: number
  reporterId: string
  reporterName: string
  entityKind: ReportEntityKind
  entityId: string
  reason: string
  notes?: string | null
  status: 'open' | 'resolved'
}

function rowToReport(r: any): Report {
  return {
    id: r.id,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    reporterId: r.reporterId,
    reporterName: r.reporterName,
    entityKind: r.entityKind,
    entityId: r.entityId,
    reason: r.reason,
    notes: r.notes ?? null,
    status: r.status,
  }
}

export async function createReport(input: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Report> {
  const d = await getDb()
  const now = Date.now()
  const r: Report = {
    id: makeId('rpt'),
    createdAt: now,
    updatedAt: now,
    reporterId: input.reporterId,
    reporterName: input.reporterName,
    entityKind: input.entityKind,
    entityId: input.entityId,
    reason: input.reason,
    notes: input.notes ?? null,
    status: 'open',
  }
  await exec(
    d,
    `INSERT INTO reports (id, createdAt, updatedAt, reporterId, reporterName, entityKind, entityId, reason, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open');`,
    [r.id, r.createdAt, r.updatedAt, r.reporterId, r.reporterName, r.entityKind, r.entityId, r.reason, r.notes ?? null],
  )
  return r
}

export async function listReports(limit = 50): Promise<Report[]> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM reports ORDER BY updatedAt DESC LIMIT ?;`, [limit])
  return rows.map(rowToReport)
}

export async function getReportById(id: string): Promise<Report | null> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM reports WHERE id = ? LIMIT 1;`, [id])
  return rows[0] ? rowToReport(rows[0]) : null
}

export async function resolveReport(id: string): Promise<void> {
  const d = await getDb()
  const now = Date.now()
  await exec(d, `UPDATE reports SET status = 'resolved', updatedAt = ? WHERE id = ?;`, [now, id])
}
