import { getDb, exec, query } from '@/core/storage/db'
import { id as makeId } from '@/core/util/id'
import { enqueueUpsert } from '@/core/cloud/enqueue'
import type { Person } from './types'
import { validateDisplayName } from './moderation'

function rowToPerson(r: any): Person {
  return {
    id: r.id,
    kind: r.kind,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    displayName: r.displayName,
    avatarSeed: r.avatarSeed ?? null,
    bio: r.bio ?? null,
    isBlocked: !!r.isBlocked,
  }
}

export async function ensureSelfPerson(): Promise<Person> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM people WHERE kind = 'self' LIMIT 1;`, [])
  if (rows[0]) return rowToPerson(rows[0])
  const now = Date.now()
  const me: Person = {
    id: makeId('me'),
    kind: 'self',
    createdAt: now,
    updatedAt: now,
    displayName: 'You',
    avatarSeed: String(Math.floor(Math.random() * 1e9)),
    bio: null,
    isBlocked: false,
  }
  await exec(
    d,
    `INSERT INTO people (id, kind, createdAt, updatedAt, displayName, avatarSeed, bio, isBlocked) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [me.id, me.kind, me.createdAt, me.updatedAt, me.displayName, me.avatarSeed ?? null, me.bio ?? null, 0],
  )
  return me
}

export async function getSelfPerson(): Promise<Person> {
  return ensureSelfPerson()
}

export async function updateSelfProfile(input: { displayName?: string; bio?: string | null }): Promise<Person> {
  const d = await getDb()
  const me = await ensureSelfPerson()
  const name = input.displayName != null ? input.displayName.trim() : me.displayName
  const v = validateDisplayName(name)
  if (!v.ok) throw new Error(v.error ?? 'Invalid name')
  const bio = input.bio != null ? input.bio : me.bio
  const updatedAt = Date.now()
  await exec(d, `UPDATE people SET displayName = ?, bio = ?, updatedAt = ? WHERE id = ?;`, [name, bio ?? null, updatedAt, me.id])
  const out = { ...me, displayName: name, bio: bio ?? null, updatedAt }
  await enqueueUpsert('people', out.id, {
    id: out.id,
    createdAt: out.createdAt,
    updatedAt: out.updatedAt,
    displayName: out.displayName,
    avatarSeed: out.avatarSeed ?? null,
    bio: out.bio ?? null,
  }, out.updatedAt)
  return out
}

export async function upsertFriendPerson(input: { id: string; displayName: string; avatarSeed?: string | null; bio?: string | null }): Promise<Person> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM people WHERE id = ? LIMIT 1;`, [input.id])
  const now = Date.now()
  const displayName = (input.displayName ?? '').trim() || 'Friend'
  if (rows[0]) {
    // Keep block status.
    await exec(
      d,
      `UPDATE people SET kind = 'friend', displayName = ?, avatarSeed = ?, bio = ?, updatedAt = ? WHERE id = ?;`,
      [displayName, input.avatarSeed ?? null, input.bio ?? null, now, input.id],
    )
    const r = await query<any>(d, `SELECT * FROM people WHERE id = ? LIMIT 1;`, [input.id])
    return rowToPerson(r[0])
  }
  await exec(
    d,
    `INSERT INTO people (id, kind, createdAt, updatedAt, displayName, avatarSeed, bio, isBlocked) VALUES (?, 'friend', ?, ?, ?, ?, ?, 0);`,
    [input.id, now, now, displayName, input.avatarSeed ?? null, input.bio ?? null],
  )
  const r2 = await query<any>(d, `SELECT * FROM people WHERE id = ? LIMIT 1;`, [input.id])
  return rowToPerson(r2[0])
}

export async function listFriends(): Promise<Person[]> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM people WHERE kind = 'friend' ORDER BY displayName ASC;`, [])
  return rows.map(rowToPerson)
}

export async function setBlocked(personId: string, blocked: boolean): Promise<void> {
  const d = await getDb()
  await exec(d, `UPDATE people SET isBlocked = ?, updatedAt = ? WHERE id = ?;`, [blocked ? 1 : 0, Date.now(), personId])
}

export async function isPersonBlocked(personId: string): Promise<boolean> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT isBlocked FROM people WHERE id = ? LIMIT 1;`, [personId])
  return !!rows[0]?.isBlocked
}
