import { isCloudConfigured } from './config'
import { getSupabase } from './supabase'
import { listSyncQueue, deleteSyncOp, recordSyncOpFailure, moveSyncOpToDeadletter, getSyncQueueSize, type SyncOp } from './syncQueueRepo'
import { getSyncState, setSyncState } from './syncStateRepo'
import { ensureSelfPerson } from '@/core/social/peopleRepo'
import { getDb, exec, query, withTransaction } from '@/core/storage/db'
import { audit } from '@/core/trust/audit'

type SyncResult = { ok: boolean; pushed: number; pulled: number; queueSize: number; error?: string }

const TABLES = {
  people: 'people',
  posts: 'posts',
  reactions: 'post_reactions',
  comments: 'post_comments',
  submissions: 'challenge_submissions',
  clips: 'clips',
  follows: 'follows',
} as const

export async function syncNow(): Promise<SyncResult> {
  const queueSize = await getSyncQueueSize().catch(() => 0)
  if (!isCloudConfigured()) return { ok: false, pushed: 0, pulled: 0, queueSize, error: 'Cloud not configured' }

  const supabase = getSupabase()
  if (!supabase) return { ok: false, pushed: 0, pulled: 0, queueSize, error: 'Cloud not configured' }

  const { data } = await supabase.auth.getSession()
  const user = data.session?.user
  if (!user) return { ok: false, pushed: 0, pulled: 0, queueSize, error: 'Not signed in' }

  await audit({ kind: 'cloud.sync', payload: { phase: 'start', queueSize } }).catch(() => {})

  let pushed = 0
  let pulled = 0

  // PUSH
  const ops = await listSyncQueue(60)
  for (const op of ops) {
    try {
      const ok = await pushOne(supabase, op, user.id)
      if (ok) {
        await deleteSyncOp(op.id)
        pushed++
      } else {
        await recordSyncOpFailure(op.id, 'Remote rejected op')
      }
    } catch (e: any) {
      await recordSyncOpFailure(op.id, String(e?.message ?? e ?? 'Sync error')).catch(() => {})
      // don't fail entire sync because of one op
    }
  }

  // PULL
  const st = await getSyncState()
  const since = st.lastPullAt || 0
  const now = Date.now()
  pulled += await pullUpdates(supabase, user.id, since)
  await setSyncState({ lastPullAt: now, lastSyncAt: now })

  const finalQueue = await getSyncQueueSize().catch(() => 0)
  await audit({ kind: 'cloud.sync', payload: { phase: 'end', pushed, pulled, queueSize: finalQueue } }).catch(() => {})
  return { ok: true, pushed, pulled, queueSize: finalQueue }
}

async function pushOne(supabase: any, op: SyncOp, authedUserId: string): Promise<boolean> {
  // Table mapping
  const table = (TABLES as any)[op.kind]
  if (!table) {
    await moveSyncOpToDeadletter(op.id, `Unknown kind: ${String(op.kind)}`)
    return true
  }

  if (op.action === 'delete') {
    // Only safe for entities owned by current user.
    const { error } = await supabase.from(table).delete().match(primaryMatch(op))
    return !error
  }

  // Ensure correct owner IDs for user-owned entities
  const payload = { ...(op.payload ?? {}) }
  if (op.kind === 'people') {
    // people.id is the user id. For self, match authed user.
    payload.id = payload.id || authedUserId
  }

  const { error } = await supabase.from(table).upsert(payload, { onConflict: onConflictFor(op.kind) })
  return !error
}

function onConflictFor(kind: string): string {
  if (kind === 'reactions') return 'postId,userId'
  if (kind === 'follows') return 'followerId,followeeId'
  // default id
  return 'id'
}

function primaryMatch(op: SyncOp): any {
  if (op.kind === 'reactions') return { postId: op.payload?.postId, userId: op.payload?.userId }
  if (op.kind === 'follows') return { followerId: op.payload?.followerId, followeeId: op.payload?.followeeId }
  return { id: op.entityId }
}

async function pullUpdates(supabase: any, authedUserId: string, since: number): Promise<number> {
  let pulled = 0

  // People: pull friends (and self)
  pulled += await pullTable(supabase, TABLES.people, since, async (d, rows) => {
    for (const r of rows) {
      // Keep local self kind.
      const kind = r.id === authedUserId ? 'self' : 'friend'
      await exec(
        d,
        `INSERT INTO people (id, kind, createdAt, updatedAt, displayName, avatarSeed, bio, isBlocked)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)
         ON CONFLICT(id) DO UPDATE SET kind = excluded.kind, updatedAt = excluded.updatedAt, displayName = excluded.displayName, avatarSeed = excluded.avatarSeed, bio = excluded.bio;`,
        [r.id, kind, Number(r.createdAt) || Date.now(), Number(r.updatedAt) || Date.now(), r.displayName ?? 'User', r.avatarSeed ?? null, r.bio ?? null],
      )
      pulled++
    }
    // Ensure self exists
    await ensureSelfPerson().catch(() => {})
  })

  // Posts
  pulled += await pullTable(supabase, TABLES.posts, since, async (d, rows) => {
    for (const r of rows) {
      await exec(
        d,
        `INSERT INTO posts (id, createdAt, updatedAt, authorId, authorName, type, title, body, payload, source, expiresAt, hidden)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'import', ?, ?)
         ON CONFLICT(id) DO UPDATE SET updatedAt = excluded.updatedAt, title = excluded.title, body = excluded.body, payload = excluded.payload, hidden = excluded.hidden;`,
        [
          r.id,
          Number(r.createdAt) || Date.now(),
          Number(r.updatedAt) || Date.now(),
          r.authorId,
          r.authorName ?? 'User',
          r.type,
          r.title ?? '',
          r.body ?? '',
          JSON.stringify(r.payload ?? {}),
          r.expiresAt ?? null,
          r.hidden ? 1 : 0,
        ],
      )
      pulled++
    }
  })

  // Submissions
  pulled += await pullTable(supabase, TABLES.submissions, since, async (d, rows) => {
    for (const r of rows) {
      await exec(
        d,
        `INSERT INTO challenge_submissions (id, createdAt, updatedAt, period, periodKey, challengeId, userId, displayName, score, details, source, expiresAt, hidden)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'import', ?, ?)
         ON CONFLICT(id) DO UPDATE SET updatedAt = excluded.updatedAt, score = excluded.score, details = excluded.details, hidden = excluded.hidden;`,
        [
          r.id,
          Number(r.createdAt) || Date.now(),
          Number(r.updatedAt) || Date.now(),
          r.period,
          r.periodKey,
          r.challengeId,
          r.userId,
          r.displayName ?? 'User',
          Number(r.score) || 0,
          JSON.stringify(r.details ?? {}),
          r.expiresAt ?? null,
          r.hidden ? 1 : 0,
        ],
      )
      pulled++
    }
  })

  // Reactions
  pulled += await pullTable(supabase, TABLES.reactions, since, async (d, rows) => {
    for (const r of rows) {
      await exec(
        d,
        `INSERT INTO post_reactions (postId, userId, reaction, createdAt, hidden)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(postId, userId) DO UPDATE SET reaction = excluded.reaction, createdAt = excluded.createdAt, hidden = excluded.hidden;`,
        [r.postId, r.userId, r.reaction, Number(r.createdAt) || Date.now(), r.hidden ? 1 : 0],
      )
      pulled++
    }
  })

  // Comments
  pulled += await pullTable(supabase, TABLES.comments, since, async (d, rows) => {
    for (const r of rows) {
      await exec(
        d,
        `INSERT INTO post_comments (id, postId, userId, userName, createdAt, body, hidden)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET body = excluded.body, hidden = excluded.hidden;`,
        [r.id, r.postId, r.userId, r.userName ?? 'User', Number(r.createdAt) || Date.now(), r.body ?? '', r.hidden ? 1 : 0],
      )
      pulled++
    }
  })

  // Clips (performance): pull metadata only (videoUri is local per device; remote stores shareableUrl if you add storage later)
  pulled += await pullTable(supabase, TABLES.clips, since, async (d, rows) => {
    for (const r of rows) {
      // Only import clip cards (no video) if missing.
      const exists = await query<any>(d, `SELECT id FROM clips WHERE id = ? LIMIT 1;`, [r.id])
      if (exists[0]) continue
      await exec(
        d,
        `INSERT INTO clips (id, createdAt, updatedAt, userId, displayName, templateId, title, durationMs, videoUri, thumbnailUri, score, metrics, hidden)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          r.id,
          Number(r.createdAt) || Date.now(),
          Number(r.updatedAt) || Date.now(),
          r.userId,
          r.displayName ?? 'User',
          r.templateId ?? 'remote',
          r.title ?? 'Performance',
          Number(r.durationMs) || 0,
          '',
          r.thumbnailUri ?? null,
          Number(r.score) || 0,
          JSON.stringify(r.metrics ?? {}),
          r.hidden ? 1 : 0,
        ],
      )
      pulled++
    }
  })

  // Follows
  pulled += await pullTable(supabase, TABLES.follows, since, async (d, rows) => {
    for (const r of rows) {
      await exec(
        d,
        `INSERT INTO follows (followerId, followeeId, createdAt)
         VALUES (?, ?, ?)
         ON CONFLICT(followerId, followeeId) DO UPDATE SET createdAt = excluded.createdAt;`,
        [r.followerId, r.followeeId, Number(r.createdAt) || Date.now()],
      )
      pulled++
    }
  })

  return pulled
}

async function pullTable(supabase: any, table: string, since: number, apply: (d: any, rows: any[]) => Promise<void>): Promise<number> {
  // We treat 'updatedAt' as bigint millis.
  const { data, error } = await supabase.from(table).select('*').gte('updatedAt', since + 1).limit(500)
  if (error || !data || !data.length) return 0
  const d = await getDb()
  await withTransaction(d, async () => {
    await apply(d, data)
  })
  return data.length
}
