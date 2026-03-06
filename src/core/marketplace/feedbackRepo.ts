import { getDb, exec, query } from '@/core/storage/db'
import { id as makeId } from '@/core/util/id'
import type { FeedbackItem } from './types'

function rowToFeedback(r: any): FeedbackItem {
  return {
    id: r.id,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    coachId: r.coachId,
    coachName: r.coachName,
    studentId: r.studentId,
    studentName: r.studentName,
    clipId: r.clipId ?? null,
    message: r.message,
    response: r.response ?? null,
    status: r.status,
  }
}

export async function createFeedbackRequest(input: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'response'>): Promise<FeedbackItem> {
  const d = await getDb()
  const now = Date.now()
  const f: FeedbackItem = {
    id: makeId('fbk'),
    createdAt: now,
    updatedAt: now,
    coachId: input.coachId,
    coachName: input.coachName,
    studentId: input.studentId,
    studentName: input.studentName,
    clipId: input.clipId ?? null,
    message: input.message,
    response: null,
    status: 'open',
  }
  await exec(
    d,
    `INSERT INTO feedback (id, createdAt, updatedAt, coachId, coachName, studentId, studentName, clipId, message, response, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'open');`,
    [f.id, f.createdAt, f.updatedAt, f.coachId, f.coachName, f.studentId, f.studentName, f.clipId, f.message],
  )
  return f
}

export async function listFeedbackForCoach(coachId: string, limit = 50): Promise<FeedbackItem[]> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM feedback WHERE coachId = ? ORDER BY updatedAt DESC LIMIT ?;`, [coachId, limit])
  return rows.map(rowToFeedback)
}

export async function getFeedbackById(id: string): Promise<FeedbackItem | null> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM feedback WHERE id = ? LIMIT 1;`, [id])
  return rows[0] ? rowToFeedback(rows[0]) : null
}

export async function replyToFeedback(id: string, response: string): Promise<FeedbackItem | null> {
  const d = await getDb()
  const now = Date.now()
  await exec(d, `UPDATE feedback SET response = ?, status = 'done', updatedAt = ? WHERE id = ?;`, [response, now, id])
  return await getFeedbackById(id)
}
