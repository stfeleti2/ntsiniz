import { getDb, exec, query } from '@/core/storage/db'
import { enqueueUpsert, enqueueDelete } from '@/core/cloud/enqueue'

export async function follow(followerId: string, followeeId: string): Promise<void> {
  const d = await getDb()
  const now = Date.now()
  await exec(
    d,
    `INSERT INTO follows (followerId, followeeId, createdAt) VALUES (?, ?, ?)
     ON CONFLICT(followerId, followeeId) DO UPDATE SET createdAt = excluded.createdAt;`,
    [followerId, followeeId, now],
  )
  await enqueueUpsert('follows', `${followerId}:${followeeId}`, { followerId, followeeId, createdAt: now, updatedAt: now }, now)
}

export async function unfollow(followerId: string, followeeId: string): Promise<void> {
  const d = await getDb()
  await exec(d, `DELETE FROM follows WHERE followerId = ? AND followeeId = ?;`, [followerId, followeeId])
  const now = Date.now()
  await enqueueDelete('follows', `${followerId}:${followeeId}`, { followerId, followeeId }, now)
}

export async function isFollowing(followerId: string, followeeId: string): Promise<boolean> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT 1 FROM follows WHERE followerId = ? AND followeeId = ? LIMIT 1;`, [followerId, followeeId])
  return !!rows[0]
}

export async function listFollowingIds(followerId: string): Promise<string[]> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT followeeId FROM follows WHERE followerId = ? ORDER BY createdAt DESC;`, [followerId])
  return rows.map((r: any) => r.followeeId)
}
