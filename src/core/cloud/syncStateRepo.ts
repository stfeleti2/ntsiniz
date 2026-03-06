import { getDb, exec, query } from '@/core/storage/db'

export type SyncState = {
  lastPullAt: number
  lastSyncAt: number
}

const KEY = 'primary'

export async function getSyncState(): Promise<SyncState> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT data FROM sync_state WHERE id = ? LIMIT 1;`, [KEY])
  if (!rows[0]) {
    const init: SyncState = { lastPullAt: 0, lastSyncAt: 0 }
    await exec(d, `INSERT INTO sync_state (id, data) VALUES (?, ?);`, [KEY, JSON.stringify(init)])
    return init
  }
  try {
    const parsed = JSON.parse(rows[0].data)
    return {
      lastPullAt: Number(parsed.lastPullAt) || 0,
      lastSyncAt: Number(parsed.lastSyncAt) || 0,
    }
  } catch {
    return { lastPullAt: 0, lastSyncAt: 0 }
  }
}

export async function setSyncState(next: SyncState): Promise<void> {
  const d = await getDb()
  await exec(
    d,
    `INSERT INTO sync_state (id, data) VALUES (?, ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data;`,
    [KEY, JSON.stringify(next)],
  )
}
