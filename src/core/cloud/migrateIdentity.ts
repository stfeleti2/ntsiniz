import { getDb, exec, query } from '@/core/storage/db'

// When cloud is enabled, we want the local 'self' person id to match the cloud user id.
// This makes share codes, follows, and future sync stable across devices.

export async function ensureCloudSelfId(remoteUserId: string, _email: string | null): Promise<void> {
  const d = await getDb()
  const selfRows = await query<any>(d, `SELECT * FROM people WHERE kind = 'self' LIMIT 1;`, [])
  if (!selfRows[0]) return

  const me = selfRows[0]
  const oldId: string = me.id
  const newId: string = remoteUserId
  if (!newId || oldId === newId) return

  const existing = await query<any>(d, `SELECT * FROM people WHERE id = ? LIMIT 1;`, [newId])
  const now = Date.now()

  if (!existing[0]) {
    await exec(
      d,
      `INSERT INTO people (id, kind, createdAt, updatedAt, displayName, avatarSeed, bio, isBlocked)
       VALUES (?, 'self', ?, ?, ?, ?, ?, 0);`,
      [newId, me.createdAt, now, me.displayName, me.avatarSeed ?? null, me.bio ?? null],
    )
  } else {
    await exec(
      d,
      `UPDATE people SET kind = 'self', displayName = ?, avatarSeed = COALESCE(?, avatarSeed), bio = COALESCE(?, bio), updatedAt = ? WHERE id = ?;`,
      [me.displayName, me.avatarSeed ?? null, me.bio ?? null, now, newId],
    )
  }

  // Rewrite references from old self id -> new self id.
  await exec(d, `UPDATE challenge_submissions SET userId = ? WHERE userId = ?;`, [newId, oldId])
  await exec(d, `UPDATE posts SET authorId = ? WHERE authorId = ?;`, [newId, oldId])
  await exec(d, `UPDATE post_reactions SET userId = ? WHERE userId = ?;`, [newId, oldId])
  await exec(d, `UPDATE post_comments SET userId = ? WHERE userId = ?;`, [newId, oldId])
  await exec(d, `UPDATE clips SET userId = ? WHERE userId = ?;`, [newId, oldId])
  await exec(d, `UPDATE follows SET followerId = ? WHERE followerId = ?;`, [newId, oldId])

  // If old row still exists and is not the same as newId, delete it.
  await exec(d, `DELETE FROM people WHERE id = ?;`, [oldId])
}
