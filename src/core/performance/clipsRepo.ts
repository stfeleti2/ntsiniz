import { getDb, exec, query } from '@/core/storage/db'
import { id as makeId } from '@/core/util/id'
import { enqueueUpsert, enqueueHide } from '@/core/cloud/enqueue'
import type { PerformanceClip } from './types'

function safeParse(v: any) {
  try {
    return typeof v === 'string' ? JSON.parse(v) : v
  } catch {
    return {}
  }
}

function rowToClip(r: any): PerformanceClip {
  return {
    id: r.id,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    userId: r.userId,
    displayName: r.displayName,
    templateId: r.templateId,
    title: r.title,
    durationMs: r.durationMs,
    videoUri: r.videoUri,
    thumbnailUri: r.thumbnailUri ?? null,
    score: r.score,
    metrics: safeParse(r.metrics),
    hidden: !!r.hidden,
  }
}

export async function createClip(input: Omit<PerformanceClip, 'id' | 'createdAt' | 'updatedAt' | 'hidden'>): Promise<PerformanceClip> {
  const d = await getDb()
  const now = Date.now()
  const clip: PerformanceClip = {
    id: makeId('clip'),
    createdAt: now,
    updatedAt: now,
    userId: input.userId,
    displayName: input.displayName,
    templateId: input.templateId,
    title: input.title,
    durationMs: input.durationMs,
    videoUri: input.videoUri,
    thumbnailUri: input.thumbnailUri ?? null,
    score: input.score,
    metrics: input.metrics ?? {},
    hidden: false,
  }
  await exec(
    d,
    `INSERT INTO clips (id, createdAt, updatedAt, userId, displayName, templateId, title, durationMs, videoUri, thumbnailUri, score, metrics, hidden)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
    [
      clip.id,
      clip.createdAt,
      clip.updatedAt,
      clip.userId,
      clip.displayName,
      clip.templateId,
      clip.title,
      clip.durationMs,
      clip.videoUri,
      clip.thumbnailUri,
      clip.score,
      JSON.stringify(clip.metrics ?? {}),
    ],
  )
  await enqueueUpsert('clips', clip.id, {
    id: clip.id,
    createdAt: clip.createdAt,
    updatedAt: clip.updatedAt,
    userId: clip.userId,
    displayName: clip.displayName,
    templateId: clip.templateId,
    title: clip.title,
    durationMs: clip.durationMs,
    // videoUri is device-local; remote can store a public URL later
    videoUri: '',
    thumbnailUri: clip.thumbnailUri ?? null,
    score: clip.score,
    metrics: clip.metrics ?? {},
    hidden: false,
  }, clip.updatedAt)
  return clip
}

export async function getClipById(clipId: string): Promise<PerformanceClip | null> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM clips WHERE id = ? LIMIT 1;`, [clipId])
  if (!rows[0]) return null
  return rowToClip(rows[0])
}

export async function listClips(limit = 40): Promise<PerformanceClip[]> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM clips WHERE hidden = 0 ORDER BY createdAt DESC LIMIT ?;`, [limit])
  return rows.map(rowToClip)
}

export async function listClipsInRange(startMs: number, endMs: number): Promise<PerformanceClip[]> {
  const d = await getDb()
  const rows = await query<any>(
    d,
    `SELECT * FROM clips WHERE hidden = 0 AND createdAt >= ? AND createdAt < ? ORDER BY createdAt ASC;`,
    [startMs, endMs],
  )
  return rows.map(rowToClip)
}

export async function hideClip(clipId: string) {
  const d = await getDb()
  const now = Date.now()
  await exec(d, `UPDATE clips SET hidden = 1, updatedAt = ? WHERE id = ?;`, [now, clipId])
  const rows = await query<any>(d, `SELECT * FROM clips WHERE id = ? LIMIT 1;`, [clipId])
  if (rows[0]) {
    const c = rowToClip(rows[0])
    await enqueueHide('clips', c.id, {
      id: c.id,
      createdAt: c.createdAt,
      updatedAt: now,
      userId: c.userId,
      displayName: c.displayName,
      templateId: c.templateId,
      title: c.title,
      durationMs: c.durationMs,
      videoUri: '',
      thumbnailUri: c.thumbnailUri ?? null,
      score: c.score,
      metrics: c.metrics ?? {},
      hidden: true,
    }, now)
  }
}
