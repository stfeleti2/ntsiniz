"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncNow = syncNow;
const config_1 = require("./config");
const supabase_1 = require("./supabase");
const syncQueueRepo_1 = require("./syncQueueRepo");
const syncStateRepo_1 = require("./syncStateRepo");
const peopleRepo_1 = require("@/core/social/peopleRepo");
const db_1 = require("@/core/storage/db");
const audit_1 = require("@/core/trust/audit");
const TABLES = {
    people: 'people',
    posts: 'posts',
    reactions: 'post_reactions',
    comments: 'post_comments',
    submissions: 'challenge_submissions',
    clips: 'clips',
    follows: 'follows',
};
async function syncNow() {
    const queueSize = await (0, syncQueueRepo_1.getSyncQueueSize)().catch(() => 0);
    if (!(0, config_1.isCloudConfigured)())
        return { ok: false, pushed: 0, pulled: 0, queueSize, error: 'Cloud not configured' };
    const supabase = (0, supabase_1.getSupabase)();
    if (!supabase)
        return { ok: false, pushed: 0, pulled: 0, queueSize, error: 'Cloud not configured' };
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user)
        return { ok: false, pushed: 0, pulled: 0, queueSize, error: 'Not signed in' };
    await (0, audit_1.audit)({ kind: 'cloud.sync', payload: { phase: 'start', queueSize } }).catch(() => { });
    let pushed = 0;
    let pulled = 0;
    // PUSH
    const ops = await (0, syncQueueRepo_1.listSyncQueue)(60);
    for (const op of ops) {
        try {
            const ok = await pushOne(supabase, op, user.id);
            if (ok) {
                await (0, syncQueueRepo_1.deleteSyncOp)(op.id);
                pushed++;
            }
            else {
                await (0, syncQueueRepo_1.recordSyncOpFailure)(op.id, 'Remote rejected op');
            }
        }
        catch (e) {
            await (0, syncQueueRepo_1.recordSyncOpFailure)(op.id, String(e?.message ?? e ?? 'Sync error')).catch(() => { });
            // don't fail entire sync because of one op
        }
    }
    // PULL
    const st = await (0, syncStateRepo_1.getSyncState)();
    const since = st.lastPullAt || 0;
    const now = Date.now();
    pulled += await pullUpdates(supabase, user.id, since);
    await (0, syncStateRepo_1.setSyncState)({ lastPullAt: now, lastSyncAt: now });
    const finalQueue = await (0, syncQueueRepo_1.getSyncQueueSize)().catch(() => 0);
    await (0, audit_1.audit)({ kind: 'cloud.sync', payload: { phase: 'end', pushed, pulled, queueSize: finalQueue } }).catch(() => { });
    return { ok: true, pushed, pulled, queueSize: finalQueue };
}
async function pushOne(supabase, op, authedUserId) {
    // Table mapping
    const table = TABLES[op.kind];
    if (!table) {
        await (0, syncQueueRepo_1.moveSyncOpToDeadletter)(op.id, `Unknown kind: ${String(op.kind)}`);
        return true;
    }
    if (op.action === 'delete') {
        // Only safe for entities owned by current user.
        const { error } = await supabase.from(table).delete().match(primaryMatch(op));
        return !error;
    }
    // Ensure correct owner IDs for user-owned entities
    const payload = { ...(op.payload ?? {}) };
    if (op.kind === 'people') {
        // people.id is the user id. For self, match authed user.
        payload.id = payload.id || authedUserId;
    }
    const { error } = await supabase.from(table).upsert(payload, { onConflict: onConflictFor(op.kind) });
    return !error;
}
function onConflictFor(kind) {
    if (kind === 'reactions')
        return 'postId,userId';
    if (kind === 'follows')
        return 'followerId,followeeId';
    // default id
    return 'id';
}
function primaryMatch(op) {
    if (op.kind === 'reactions')
        return { postId: op.payload?.postId, userId: op.payload?.userId };
    if (op.kind === 'follows')
        return { followerId: op.payload?.followerId, followeeId: op.payload?.followeeId };
    return { id: op.entityId };
}
async function pullUpdates(supabase, authedUserId, since) {
    let pulled = 0;
    // People: pull friends (and self)
    pulled += await pullTable(supabase, TABLES.people, since, async (d, rows) => {
        for (const r of rows) {
            // Keep local self kind.
            const kind = r.id === authedUserId ? 'self' : 'friend';
            await (0, db_1.exec)(d, `INSERT INTO people (id, kind, createdAt, updatedAt, displayName, avatarSeed, bio, isBlocked)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)
         ON CONFLICT(id) DO UPDATE SET kind = excluded.kind, updatedAt = excluded.updatedAt, displayName = excluded.displayName, avatarSeed = excluded.avatarSeed, bio = excluded.bio;`, [r.id, kind, Number(r.createdAt) || Date.now(), Number(r.updatedAt) || Date.now(), r.displayName ?? 'User', r.avatarSeed ?? null, r.bio ?? null]);
            pulled++;
        }
        // Ensure self exists
        await (0, peopleRepo_1.ensureSelfPerson)().catch(() => { });
    });
    // Posts
    pulled += await pullTable(supabase, TABLES.posts, since, async (d, rows) => {
        for (const r of rows) {
            await (0, db_1.exec)(d, `INSERT INTO posts (id, createdAt, updatedAt, authorId, authorName, type, title, body, payload, source, expiresAt, hidden)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'import', ?, ?)
         ON CONFLICT(id) DO UPDATE SET updatedAt = excluded.updatedAt, title = excluded.title, body = excluded.body, payload = excluded.payload, hidden = excluded.hidden;`, [
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
            ]);
            pulled++;
        }
    });
    // Submissions
    pulled += await pullTable(supabase, TABLES.submissions, since, async (d, rows) => {
        for (const r of rows) {
            await (0, db_1.exec)(d, `INSERT INTO challenge_submissions (id, createdAt, updatedAt, period, periodKey, challengeId, userId, displayName, score, details, source, expiresAt, hidden)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'import', ?, ?)
         ON CONFLICT(id) DO UPDATE SET updatedAt = excluded.updatedAt, score = excluded.score, details = excluded.details, hidden = excluded.hidden;`, [
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
            ]);
            pulled++;
        }
    });
    // Reactions
    pulled += await pullTable(supabase, TABLES.reactions, since, async (d, rows) => {
        for (const r of rows) {
            await (0, db_1.exec)(d, `INSERT INTO post_reactions (postId, userId, reaction, createdAt, hidden)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(postId, userId) DO UPDATE SET reaction = excluded.reaction, createdAt = excluded.createdAt, hidden = excluded.hidden;`, [r.postId, r.userId, r.reaction, Number(r.createdAt) || Date.now(), r.hidden ? 1 : 0]);
            pulled++;
        }
    });
    // Comments
    pulled += await pullTable(supabase, TABLES.comments, since, async (d, rows) => {
        for (const r of rows) {
            await (0, db_1.exec)(d, `INSERT INTO post_comments (id, postId, userId, userName, createdAt, body, hidden)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET body = excluded.body, hidden = excluded.hidden;`, [r.id, r.postId, r.userId, r.userName ?? 'User', Number(r.createdAt) || Date.now(), r.body ?? '', r.hidden ? 1 : 0]);
            pulled++;
        }
    });
    // Clips (performance): pull metadata only (videoUri is local per device; remote stores shareableUrl if you add storage later)
    pulled += await pullTable(supabase, TABLES.clips, since, async (d, rows) => {
        for (const r of rows) {
            // Only import clip cards (no video) if missing.
            const exists = await (0, db_1.query)(d, `SELECT id FROM clips WHERE id = ? LIMIT 1;`, [r.id]);
            if (exists[0])
                continue;
            await (0, db_1.exec)(d, `INSERT INTO clips (id, createdAt, updatedAt, userId, displayName, templateId, title, durationMs, videoUri, thumbnailUri, score, metrics, hidden)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, [
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
            ]);
            pulled++;
        }
    });
    // Follows
    pulled += await pullTable(supabase, TABLES.follows, since, async (d, rows) => {
        for (const r of rows) {
            await (0, db_1.exec)(d, `INSERT INTO follows (followerId, followeeId, createdAt)
         VALUES (?, ?, ?)
         ON CONFLICT(followerId, followeeId) DO UPDATE SET createdAt = excluded.createdAt;`, [r.followerId, r.followeeId, Number(r.createdAt) || Date.now()]);
            pulled++;
        }
    });
    return pulled;
}
async function pullTable(supabase, table, since, apply) {
    // We treat 'updatedAt' as bigint millis.
    const { data, error } = await supabase.from(table).select('*').gte('updatedAt', since + 1).limit(500);
    if (error || !data || !data.length)
        return 0;
    const d = await (0, db_1.getDb)();
    await (0, db_1.withTransaction)(d, async () => {
        await apply(d, data);
    });
    return data.length;
}
