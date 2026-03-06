import { getDb, exec, query } from '@/core/storage/db'

export type Identity = {
  id: 'primary'
  provider: 'supabase'
  remoteUserId: string | null
  email: string | null
  updatedAt: number
}

function rowToIdentity(r: any): Identity {
  return {
    id: 'primary',
    provider: r.provider,
    remoteUserId: r.remoteUserId ?? null,
    email: r.email ?? null,
    updatedAt: r.updatedAt,
  }
}

export async function getIdentity(): Promise<Identity> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM identities WHERE id = 'primary' LIMIT 1;`, [])
  if (rows[0]) return rowToIdentity(rows[0])
  const now = Date.now()
  await exec(d, `INSERT INTO identities (id, provider, remoteUserId, email, updatedAt) VALUES ('primary', 'supabase', NULL, NULL, ?);`, [now])
  const rows2 = await query<any>(d, `SELECT * FROM identities WHERE id = 'primary' LIMIT 1;`, [])
  return rowToIdentity(rows2[0])
}

export async function setIdentity(input: { remoteUserId: string | null; email: string | null }): Promise<Identity> {
  const d = await getDb()
  const now = Date.now()
  await exec(
    d,
    `INSERT INTO identities (id, provider, remoteUserId, email, updatedAt)
     VALUES ('primary', 'supabase', ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET remoteUserId = excluded.remoteUserId, email = excluded.email, updatedAt = excluded.updatedAt;`,
    [input.remoteUserId, input.email, now],
  )
  const rows = await query<any>(d, `SELECT * FROM identities WHERE id = 'primary' LIMIT 1;`, [])
  return rowToIdentity(rows[0])
}

export async function ensureAuthedIdentity(): Promise<{ userId: string; displayName: string; email: string | null }> {
  const identity = await getIdentity()
  const userId = identity.remoteUserId ?? 'local_user'
  const displayName =
    identity.email?.split('@')[0]?.trim() ||
    (identity.remoteUserId ? `user_${identity.remoteUserId.slice(0, 6)}` : 'Ntsiniz User')
  return { userId, displayName, email: identity.email }
}
