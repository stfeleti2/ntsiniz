"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = createPost;
exports.upsertImportedPost = upsertImportedPost;
exports.listFeedPosts = listFeedPosts;
exports.listFeedPostsWithStats = listFeedPostsWithStats;
exports.listPostsByAuthorWithStats = listPostsByAuthorWithStats;
exports.getPostById = getPostById;
exports.hidePost = hidePost;
exports.setReaction = setReaction;
exports.removeReaction = removeReaction;
exports.listReactions = listReactions;
exports.addComment = addComment;
exports.listComments = listComments;
exports.hideComment = hideComment;
const db_1 = require("@/core/storage/db");
const id_1 = require("@/core/util/id");
const enqueue_1 = require("@/core/cloud/enqueue");
const moderation_1 = require("./moderation");
function safeParse(v) {
    try {
        return typeof v === 'string' ? JSON.parse(v) : v;
    }
    catch {
        return {};
    }
}
function rowToPost(r) {
    return {
        id: r.id,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        authorId: r.authorId,
        authorName: r.authorName,
        type: r.type,
        title: r.title,
        body: r.body,
        payload: safeParse(r.payload),
        source: r.source,
        expiresAt: r.expiresAt ?? null,
        hidden: !!r.hidden,
    };
}
function rowToReaction(r) {
    return { postId: r.postId, userId: r.userId, reaction: r.reaction, createdAt: r.createdAt };
}
function rowToComment(r) {
    return {
        id: r.id,
        postId: r.postId,
        userId: r.userId,
        userName: r.userName,
        createdAt: r.createdAt,
        body: r.body,
        hidden: !!r.hidden,
    };
}
async function createPost(input) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    const post = {
        id: (0, id_1.id)('post'),
        createdAt: now,
        updatedAt: now,
        authorId: input.authorId,
        authorName: input.authorName,
        type: input.type,
        title: (0, moderation_1.sanitizeText)(input.title),
        body: (0, moderation_1.sanitizeText)(input.body),
        payload: input.payload ?? {},
        source: input.source,
        expiresAt: input.expiresAt ?? null,
        hidden: false,
    };
    await (0, db_1.exec)(d, `INSERT INTO posts (id, createdAt, updatedAt, authorId, authorName, type, title, body, payload, source, expiresAt, hidden)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`, [
        post.id,
        post.createdAt,
        post.updatedAt,
        post.authorId,
        post.authorName,
        post.type,
        post.title,
        post.body,
        JSON.stringify(post.payload ?? {}),
        post.source,
        post.expiresAt ?? null,
    ]);
    if (post.source === 'self') {
        await (0, enqueue_1.enqueueUpsert)('posts', post.id, {
            id: post.id,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            authorId: post.authorId,
            authorName: post.authorName,
            type: post.type,
            title: post.title,
            body: post.body,
            payload: post.payload ?? {},
            expiresAt: post.expiresAt ?? null,
            hidden: false,
        }, post.updatedAt);
    }
    return post;
}
async function upsertImportedPost(input) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    // De-dupe imported posts by a stable hash-ish key: authorId + title + createdAt bucket.
    const dedupeKey = `${input.authorId}:${(0, moderation_1.sanitizeText)(input.title)}:${(0, moderation_1.sanitizeText)(input.body)}`;
    const rows = await (0, db_1.query)(d, `SELECT * FROM posts WHERE source = 'import' AND (authorId || ':' || title || ':' || body) = ? LIMIT 1;`, [dedupeKey]);
    if (rows[0])
        return rowToPost(rows[0]);
    const post = {
        id: (0, id_1.id)('post'),
        createdAt: now,
        updatedAt: now,
        authorId: input.authorId,
        authorName: input.authorName,
        type: input.type,
        title: (0, moderation_1.sanitizeText)(input.title),
        body: (0, moderation_1.sanitizeText)(input.body),
        payload: input.payload ?? {},
        source: 'import',
        expiresAt: input.expiresAt ?? null,
        hidden: false,
    };
    await (0, db_1.exec)(d, `INSERT INTO posts (id, createdAt, updatedAt, authorId, authorName, type, title, body, payload, source, expiresAt, hidden)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'import', ?, 0);`, [post.id, post.createdAt, post.updatedAt, post.authorId, post.authorName, post.type, post.title, post.body, JSON.stringify(post.payload ?? {}), post.expiresAt ?? null]);
    return post;
}
async function listFeedPosts(limit = 80) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM posts WHERE hidden = 0 ORDER BY createdAt DESC LIMIT ?;`, [limit]);
    const now = Date.now();
    return rows
        .map(rowToPost)
        .filter((p) => !p.expiresAt || p.expiresAt > now);
}
async function listFeedPostsWithStats(limit = 80) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `
    SELECT
      p.*, 
      (SELECT COUNT(1) FROM post_reactions r WHERE r.postId = p.id AND r.hidden = 0) AS reactionsCount,
      (SELECT COUNT(1) FROM post_comments c WHERE c.postId = p.id AND c.hidden = 0) AS commentsCount,
      (SELECT COUNT(1) FROM posts p2 WHERE p2.authorId = p.authorId AND p2.hidden = 0) AS authorPostCount
    FROM posts p
    WHERE p.hidden = 0
    ORDER BY p.createdAt DESC
    LIMIT ?;
    `, [limit]);
    const now = Date.now();
    return rows
        .map((r) => {
        const p = rowToPost(r);
        return {
            ...p,
            stats: {
                reactions: Number(r.reactionsCount ?? 0) || 0,
                comments: Number(r.commentsCount ?? 0) || 0,
                authorPostCount: Number(r.authorPostCount ?? 0) || 0,
            },
        };
    })
        .filter((p) => !p.expiresAt || p.expiresAt > now);
}
async function listPostsByAuthorWithStats(authorId, limit = 50) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `
    SELECT
      p.*,
      (SELECT COUNT(1) FROM post_reactions r WHERE r.postId = p.id AND r.hidden = 0) AS reactionsCount,
      (SELECT COUNT(1) FROM post_comments c WHERE c.postId = p.id AND c.hidden = 0) AS commentsCount,
      (SELECT COUNT(1) FROM posts p2 WHERE p2.authorId = p.authorId AND p2.hidden = 0) AS authorPostCount
    FROM posts p
    WHERE p.hidden = 0 AND p.authorId = ?
    ORDER BY p.createdAt DESC
    LIMIT ?;
    `, [authorId, limit]);
    const now = Date.now();
    return rows
        .map((r) => {
        const p = rowToPost(r);
        return {
            ...p,
            stats: {
                reactions: Number(r.reactionsCount ?? 0) || 0,
                comments: Number(r.commentsCount ?? 0) || 0,
                authorPostCount: Number(r.authorPostCount ?? 0) || 0,
            },
        };
    })
        .filter((p) => !p.expiresAt || p.expiresAt > now);
}
async function getPostById(postId) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM posts WHERE id = ? LIMIT 1;`, [postId]);
    if (!rows[0])
        return null;
    return rowToPost(rows[0]);
}
async function hidePost(postId) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    await (0, db_1.exec)(d, `UPDATE posts SET hidden = 1, updatedAt = ? WHERE id = ?;`, [now, postId]);
    const rows = await (0, db_1.query)(d, `SELECT * FROM posts WHERE id = ? LIMIT 1;`, [postId]);
    if (rows[0]) {
        const p = rowToPost(rows[0]);
        if (p.source === 'self') {
            await (0, enqueue_1.enqueueHide)('posts', p.id, {
                id: p.id,
                createdAt: p.createdAt,
                updatedAt: now,
                authorId: p.authorId,
                authorName: p.authorName,
                type: p.type,
                title: p.title,
                body: p.body,
                payload: p.payload ?? {},
                expiresAt: p.expiresAt ?? null,
                hidden: true,
            }, now);
        }
    }
}
async function setReaction(input) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    const rows = await (0, db_1.query)(d, `SELECT * FROM post_reactions WHERE postId = ? AND userId = ? LIMIT 1;`, [input.postId, input.userId]);
    if (rows[0]) {
        await (0, db_1.exec)(d, `UPDATE post_reactions SET reaction = ?, createdAt = ?, hidden = 0 WHERE postId = ? AND userId = ?;`, [input.reaction, now, input.postId, input.userId]);
        await (0, enqueue_1.enqueueUpsert)('reactions', `${input.postId}:${input.userId}`, { postId: input.postId, userId: input.userId, reaction: input.reaction, createdAt: now, updatedAt: now }, now);
        return;
    }
    await (0, db_1.exec)(d, `INSERT INTO post_reactions (postId, userId, reaction, createdAt, hidden) VALUES (?, ?, ?, ?, 0);`, [input.postId, input.userId, input.reaction, now]);
    await (0, enqueue_1.enqueueUpsert)('reactions', `${input.postId}:${input.userId}`, { postId: input.postId, userId: input.userId, reaction: input.reaction, createdAt: now, updatedAt: now }, now);
}
async function removeReaction(input) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    await (0, db_1.exec)(d, `UPDATE post_reactions SET hidden = 1, createdAt = ? WHERE postId = ? AND userId = ?;`, [now, input.postId, input.userId]);
    await (0, enqueue_1.enqueueHide)('reactions', `${input.postId}:${input.userId}`, { postId: input.postId, userId: input.userId, hidden: true, updatedAt: now }, now);
}
async function listReactions(postId) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM post_reactions WHERE postId = ? AND hidden = 0 ORDER BY createdAt DESC;`, [postId]);
    return rows.map(rowToReaction);
}
async function addComment(input) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    const c = {
        id: (0, id_1.id)('cmt'),
        postId: input.postId,
        userId: input.userId,
        userName: (0, moderation_1.sanitizeText)(input.userName),
        createdAt: now,
        body: (0, moderation_1.sanitizeText)(input.body),
        hidden: false,
    };
    await (0, db_1.exec)(d, `INSERT INTO post_comments (id, postId, userId, userName, createdAt, body, hidden) VALUES (?, ?, ?, ?, ?, ?, 0);`, [c.id, c.postId, c.userId, c.userName, c.createdAt, c.body]);
    await (0, enqueue_1.enqueueUpsert)('comments', c.id, {
        id: c.id,
        postId: c.postId,
        userId: c.userId,
        userName: c.userName,
        createdAt: c.createdAt,
        body: c.body,
        hidden: false,
        updatedAt: c.createdAt,
    }, c.createdAt);
    return c;
}
async function listComments(postId, limit = 80) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM post_comments WHERE postId = ? AND hidden = 0 ORDER BY createdAt ASC LIMIT ?;`, [postId, limit]);
    return rows.map(rowToComment);
}
async function hideComment(commentId) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    await (0, db_1.exec)(d, `UPDATE post_comments SET hidden = 1 WHERE id = ?;`, [commentId]);
    const rows = await (0, db_1.query)(d, `SELECT * FROM post_comments WHERE id = ? LIMIT 1;`, [commentId]);
    if (rows[0]) {
        const c = rowToComment(rows[0]);
        await (0, enqueue_1.enqueueHide)('comments', c.id, {
            id: c.id,
            postId: c.postId,
            userId: c.userId,
            userName: c.userName,
            createdAt: c.createdAt,
            body: c.body,
            hidden: true,
            updatedAt: now,
        }, now);
    }
}
