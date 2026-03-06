import { getDb, exec, query } from '@/core/storage/db'
import { id as makeId } from '@/core/util/id'
import { enqueueUpsert, enqueueHide } from '@/core/cloud/enqueue'
import type { Post, PostComment, PostReaction } from './types'
import { sanitizeText } from './moderation'
import type { FeedPostWithStats } from './feedTypes'

function safeParse(v: any) {
  try {
    return typeof v === 'string' ? JSON.parse(v) : v
  } catch {
    return {}
  }
}

function rowToPost(r: any): Post {
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
  }
}

function rowToReaction(r: any): PostReaction {
  return { postId: r.postId, userId: r.userId, reaction: r.reaction, createdAt: r.createdAt }
}

function rowToComment(r: any): PostComment {
  return {
    id: r.id,
    postId: r.postId,
    userId: r.userId,
    userName: r.userName,
    createdAt: r.createdAt,
    body: r.body,
    hidden: !!r.hidden,
  }
}

export async function createPost(input: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'hidden'>): Promise<Post> {
  const d = await getDb()
  const now = Date.now()
  const post: Post = {
    id: makeId('post'),
    createdAt: now,
    updatedAt: now,
    authorId: input.authorId,
    authorName: input.authorName,
    type: input.type,
    title: sanitizeText(input.title),
    body: sanitizeText(input.body),
    payload: input.payload ?? {},
    source: input.source,
    expiresAt: input.expiresAt ?? null,
    hidden: false,
  }
  await exec(
    d,
    `INSERT INTO posts (id, createdAt, updatedAt, authorId, authorName, type, title, body, payload, source, expiresAt, hidden)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
    [
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
    ],
  )
  if (post.source === 'self') {
    await enqueueUpsert('posts', post.id, {
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
    }, post.updatedAt)
  }
  return post
}

export async function upsertImportedPost(input: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'source'> & { expiresAt?: number | null }): Promise<Post> {
  const d = await getDb()
  const now = Date.now()
  // De-dupe imported posts by a stable hash-ish key: authorId + title + createdAt bucket.
  const dedupeKey = `${input.authorId}:${sanitizeText(input.title)}:${sanitizeText(input.body)}`
  const rows = await query<any>(d, `SELECT * FROM posts WHERE source = 'import' AND (authorId || ':' || title || ':' || body) = ? LIMIT 1;`, [dedupeKey])
  if (rows[0]) return rowToPost(rows[0])
  const post: Post = {
    id: makeId('post'),
    createdAt: now,
    updatedAt: now,
    authorId: input.authorId,
    authorName: input.authorName,
    type: input.type,
    title: sanitizeText(input.title),
    body: sanitizeText(input.body),
    payload: input.payload ?? {},
    source: 'import',
    expiresAt: input.expiresAt ?? null,
    hidden: false,
  }
  await exec(
    d,
    `INSERT INTO posts (id, createdAt, updatedAt, authorId, authorName, type, title, body, payload, source, expiresAt, hidden)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'import', ?, 0);`,
    [post.id, post.createdAt, post.updatedAt, post.authorId, post.authorName, post.type, post.title, post.body, JSON.stringify(post.payload ?? {}), post.expiresAt ?? null],
  )
  return post
}

export async function listFeedPosts(limit = 80): Promise<Post[]> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM posts WHERE hidden = 0 ORDER BY createdAt DESC LIMIT ?;`, [limit])
  const now = Date.now()
  return rows
    .map(rowToPost)
    .filter((p) => !p.expiresAt || p.expiresAt > now)
}

export async function listFeedPostsWithStats(limit = 80): Promise<FeedPostWithStats[]> {
  const d = await getDb()
  const rows = await query<any>(
    d,
    `
    SELECT
      p.*, 
      (SELECT COUNT(1) FROM post_reactions r WHERE r.postId = p.id AND r.hidden = 0) AS reactionsCount,
      (SELECT COUNT(1) FROM post_comments c WHERE c.postId = p.id AND c.hidden = 0) AS commentsCount,
      (SELECT COUNT(1) FROM posts p2 WHERE p2.authorId = p.authorId AND p2.hidden = 0) AS authorPostCount
    FROM posts p
    WHERE p.hidden = 0
    ORDER BY p.createdAt DESC
    LIMIT ?;
    `,
    [limit],
  )
  const now = Date.now()
  return rows
    .map((r) => {
      const p = rowToPost(r)
      return {
        ...p,
        stats: {
          reactions: Number(r.reactionsCount ?? 0) || 0,
          comments: Number(r.commentsCount ?? 0) || 0,
          authorPostCount: Number(r.authorPostCount ?? 0) || 0,
        },
      } satisfies FeedPostWithStats
    })
    .filter((p) => !p.expiresAt || p.expiresAt > now)
}

export async function listPostsByAuthorWithStats(authorId: string, limit = 50): Promise<FeedPostWithStats[]> {
  const d = await getDb()
  const rows = await query<any>(
    d,
    `
    SELECT
      p.*,
      (SELECT COUNT(1) FROM post_reactions r WHERE r.postId = p.id AND r.hidden = 0) AS reactionsCount,
      (SELECT COUNT(1) FROM post_comments c WHERE c.postId = p.id AND c.hidden = 0) AS commentsCount,
      (SELECT COUNT(1) FROM posts p2 WHERE p2.authorId = p.authorId AND p2.hidden = 0) AS authorPostCount
    FROM posts p
    WHERE p.hidden = 0 AND p.authorId = ?
    ORDER BY p.createdAt DESC
    LIMIT ?;
    `,
    [authorId, limit],
  )
  const now = Date.now()
  return rows
    .map((r) => {
      const p = rowToPost(r)
      return {
        ...p,
        stats: {
          reactions: Number(r.reactionsCount ?? 0) || 0,
          comments: Number(r.commentsCount ?? 0) || 0,
          authorPostCount: Number(r.authorPostCount ?? 0) || 0,
        },
      } satisfies FeedPostWithStats
    })
    .filter((p) => !p.expiresAt || p.expiresAt > now)
}

export async function getPostById(postId: string): Promise<Post | null> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM posts WHERE id = ? LIMIT 1;`, [postId])
  if (!rows[0]) return null
  return rowToPost(rows[0])
}

export async function hidePost(postId: string) {
  const d = await getDb()
  const now = Date.now()
  await exec(d, `UPDATE posts SET hidden = 1, updatedAt = ? WHERE id = ?;`, [now, postId])
  const rows = await query<any>(d, `SELECT * FROM posts WHERE id = ? LIMIT 1;`, [postId])
  if (rows[0]) {
    const p = rowToPost(rows[0])
    if (p.source === 'self') {
      await enqueueHide('posts', p.id, {
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
      }, now)
    }
  }
}

export async function setReaction(input: { postId: string; userId: string; reaction: string }): Promise<void> {
  const d = await getDb()
  const now = Date.now()
  const rows = await query<any>(d, `SELECT * FROM post_reactions WHERE postId = ? AND userId = ? LIMIT 1;`, [input.postId, input.userId])
  if (rows[0]) {
    await exec(d, `UPDATE post_reactions SET reaction = ?, createdAt = ?, hidden = 0 WHERE postId = ? AND userId = ?;`, [input.reaction, now, input.postId, input.userId])
    await enqueueUpsert('reactions', `${input.postId}:${input.userId}`, { postId: input.postId, userId: input.userId, reaction: input.reaction, createdAt: now, updatedAt: now }, now)
    return
  }
  await exec(d, `INSERT INTO post_reactions (postId, userId, reaction, createdAt, hidden) VALUES (?, ?, ?, ?, 0);`, [input.postId, input.userId, input.reaction, now])
  await enqueueUpsert('reactions', `${input.postId}:${input.userId}`, { postId: input.postId, userId: input.userId, reaction: input.reaction, createdAt: now, updatedAt: now }, now)
}


export async function removeReaction(input: { postId: string; userId: string }): Promise<void> {
  const d = await getDb()
  const now = Date.now()
  await exec(d, `UPDATE post_reactions SET hidden = 1, createdAt = ? WHERE postId = ? AND userId = ?;`, [now, input.postId, input.userId])
  await enqueueHide('reactions', `${input.postId}:${input.userId}`, { postId: input.postId, userId: input.userId, hidden: true, updatedAt: now }, now)
}

export async function listReactions(postId: string): Promise<PostReaction[]> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM post_reactions WHERE postId = ? AND hidden = 0 ORDER BY createdAt DESC;`, [postId])
  return rows.map(rowToReaction)
}

export async function addComment(input: Omit<PostComment, 'id' | 'createdAt' | 'hidden'>): Promise<PostComment> {
  const d = await getDb()
  const now = Date.now()
  const c: PostComment = {
    id: makeId('cmt'),
    postId: input.postId,
    userId: input.userId,
    userName: sanitizeText(input.userName),
    createdAt: now,
    body: sanitizeText(input.body),
    hidden: false,
  }
  await exec(
    d,
    `INSERT INTO post_comments (id, postId, userId, userName, createdAt, body, hidden) VALUES (?, ?, ?, ?, ?, ?, 0);`,
    [c.id, c.postId, c.userId, c.userName, c.createdAt, c.body],
  )
  await enqueueUpsert('comments', c.id, {
    id: c.id,
    postId: c.postId,
    userId: c.userId,
    userName: c.userName,
    createdAt: c.createdAt,
    body: c.body,
    hidden: false,
    updatedAt: c.createdAt,
  }, c.createdAt)
  return c
}

export async function listComments(postId: string, limit = 80): Promise<PostComment[]> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM post_comments WHERE postId = ? AND hidden = 0 ORDER BY createdAt ASC LIMIT ?;`, [postId, limit])
  return rows.map(rowToComment)
}

export async function hideComment(commentId: string) {
  const d = await getDb()
  const now = Date.now()
  await exec(d, `UPDATE post_comments SET hidden = 1 WHERE id = ?;`, [commentId])
  const rows = await query<any>(d, `SELECT * FROM post_comments WHERE id = ? LIMIT 1;`, [commentId])
  if (rows[0]) {
    const c = rowToComment(rows[0])
    await enqueueHide('comments', c.id, {
      id: c.id,
      postId: c.postId,
      userId: c.userId,
      userName: c.userName,
      createdAt: c.createdAt,
      body: c.body,
      hidden: true,
      updatedAt: now,
    }, now)
  }
}
