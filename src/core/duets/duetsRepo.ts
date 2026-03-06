import { getDb, exec, query } from '@/core/storage/db'
import type { Duet, DuetRole, DuetStatus } from './types'
import { id as makeId } from '@/core/util/id'

function rowToDuet(r: any): Duet {
  return {
    id: r.id,
    createdAt: Number(r.createdAt) || 0,
    updatedAt: Number(r.updatedAt) || 0,
    inviteId: r.inviteId,
    role: r.role as DuetRole,
    inviterId: r.inviterId,
    inviterName: r.inviterName,
    title: r.title,
    sampleRate: Number(r.sampleRate) || 44100,
    durationMs: Number(r.durationMs) || 0,
    partAUri: r.partAUri,
    partBUri: r.partBUri ?? null,
    mixUri: r.mixUri ?? null,
    status: r.status as DuetStatus,
    source: (r.source as any) === 'import' ? 'import' : 'self',
    expiresAt: r.expiresAt ?? null,
    hidden: !!r.hidden,
  }
}

export async function listDuets(limit = 50): Promise<Duet[]> {
  const d = await getDb()
  const rows = await query<any>(
    d,
    `SELECT * FROM duets WHERE hidden = 0 ORDER BY createdAt DESC LIMIT ?;`,
    [limit],
  )
  const now = Date.now()
  return rows
    .map(rowToDuet)
    .filter((x) => !x.expiresAt || x.expiresAt > now)
}

export async function getDuetById(id: string): Promise<Duet | null> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM duets WHERE id = ? LIMIT 1;`, [id])
  if (!rows[0]) return null
  return rowToDuet(rows[0])
}

export async function getDuetByInviteId(inviteId: string): Promise<Duet | null> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM duets WHERE inviteId = ? AND hidden = 0 LIMIT 1;`, [inviteId])
  if (!rows[0]) return null
  return rowToDuet(rows[0])
}

export async function createDuetInvite(input: {
  inviteId?: string
  inviterId: string
  inviterName: string
  title: string
  sampleRate: number
  durationMs: number
  partAUri: string
  expiresAt?: number | null
}): Promise<Duet> {
  const d = await getDb()
  const now = Date.now()
  const inviteId = input.inviteId || makeId('duet')
  const duet: Duet = {
    id: inviteId,
    createdAt: now,
    updatedAt: now,
    inviteId,
    role: 'inviter',
    inviterId: input.inviterId,
    inviterName: input.inviterName,
    title: input.title,
    sampleRate: input.sampleRate,
    durationMs: input.durationMs,
    partAUri: input.partAUri,
    partBUri: null,
    mixUri: null,
    status: 'invited',
    source: 'self',
    expiresAt: input.expiresAt ?? null,
    hidden: false,
  }
  await exec(
    d,
    `INSERT INTO duets (id, createdAt, updatedAt, inviteId, role, inviterId, inviterName, title, sampleRate, durationMs, partAUri, partBUri, mixUri, status, source, expiresAt, hidden)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, 'self', ?, 0)
     ON CONFLICT(id) DO UPDATE SET updatedAt = excluded.updatedAt, title = excluded.title, partAUri = excluded.partAUri;`,
    [
      duet.id,
      duet.createdAt,
      duet.updatedAt,
      duet.inviteId,
      duet.role,
      duet.inviterId,
      duet.inviterName,
      duet.title,
      duet.sampleRate,
      duet.durationMs,
      duet.partAUri,
      duet.status,
      duet.expiresAt ?? null,
    ],
  )
  return duet
}

export async function upsertImportedDuetInvite(input: {
  inviteId: string
  inviterId: string
  inviterName: string
  title: string
  sampleRate: number
  durationMs: number
  partAUri: string
  expiresAt?: number | null
}): Promise<Duet> {
  const d = await getDb()
  const now = Date.now()
  const duet: Duet = {
    id: input.inviteId,
    createdAt: now,
    updatedAt: now,
    inviteId: input.inviteId,
    role: 'responder',
    inviterId: input.inviterId,
    inviterName: input.inviterName,
    title: input.title,
    sampleRate: input.sampleRate,
    durationMs: input.durationMs,
    partAUri: input.partAUri,
    partBUri: null,
    mixUri: null,
    status: 'invited',
    source: 'import',
    expiresAt: input.expiresAt ?? null,
    hidden: false,
  }
  await exec(
    d,
    `INSERT INTO duets (id, createdAt, updatedAt, inviteId, role, inviterId, inviterName, title, sampleRate, durationMs, partAUri, partBUri, mixUri, status, source, expiresAt, hidden)
     VALUES (?, ?, ?, ?, 'responder', ?, ?, ?, ?, ?, ?, NULL, NULL, 'invited', 'import', ?, 0)
     ON CONFLICT(id) DO UPDATE SET updatedAt = excluded.updatedAt, title = excluded.title, partAUri = excluded.partAUri, expiresAt = excluded.expiresAt;`,
    [
      duet.id,
      duet.createdAt,
      duet.updatedAt,
      duet.inviteId,
      duet.inviterId,
      duet.inviterName,
      duet.title,
      duet.sampleRate,
      duet.durationMs,
      duet.partAUri,
      duet.expiresAt ?? null,
    ],
  )
  return duet
}

export async function setDuetPartB(input: { duetId: string; partBUri: string; durationMs?: number }): Promise<void> {
  const d = await getDb()
  const now = Date.now()
  await exec(d, `UPDATE duets SET partBUri = ?, status = 'recorded', durationMs = COALESCE(?, durationMs), updatedAt = ? WHERE id = ?;`, [input.partBUri, input.durationMs ?? null, now, input.duetId])
}

export async function setDuetMix(input: { duetId: string; mixUri: string; durationMs?: number }): Promise<void> {
  const d = await getDb()
  const now = Date.now()
  await exec(d, `UPDATE duets SET mixUri = ?, status = 'mixed', durationMs = COALESCE(?, durationMs), updatedAt = ? WHERE id = ?;`, [input.mixUri, input.durationMs ?? null, now, input.duetId])
}

export async function hideDuet(duetId: string): Promise<void> {
  const d = await getDb()
  const now = Date.now()
  await exec(d, `UPDATE duets SET hidden = 1, updatedAt = ? WHERE id = ?;`, [now, duetId])
}
