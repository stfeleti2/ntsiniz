import { getDb, exec, query } from '@/core/storage/db'
import { id as makeId } from '@/core/util/id'
import type { Enrollment } from './types'
import { safeJsonParse } from '@/core/utils/safeJson'

function rowToEnrollment(r: any): Enrollment {
  return {
    id: r.id,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    userId: r.userId,
    programId: r.programId,
    coachId: r.coachId,
    currentDay: r.currentDay,
    completedDaysJson: r.completedDaysJson,
  }
}

export function parseCompletedDays(json: string): number[] {
  try {
    const v = safeJsonParse(json, {})
    if (Array.isArray(v)) return v.filter((x) => typeof x === 'number')
  } catch {}
  return []
}

export async function enrollInProgram(input: { userId: string; programId: string; coachId: string }): Promise<Enrollment> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM enrollments WHERE userId = ? AND programId = ? LIMIT 1;`, [input.userId, input.programId])
  const now = Date.now()
  if (rows[0]) {
    await exec(d, `UPDATE enrollments SET updatedAt = ?, coachId = ? WHERE id = ?;`, [now, input.coachId, rows[0].id])
    const r2 = await query<any>(d, `SELECT * FROM enrollments WHERE id = ? LIMIT 1;`, [rows[0].id])
    return rowToEnrollment(r2[0])
  }
  const e: Enrollment = {
    id: makeId('enr'),
    createdAt: now,
    updatedAt: now,
    userId: input.userId,
    programId: input.programId,
    coachId: input.coachId,
    currentDay: 1,
    completedDaysJson: JSON.stringify([]),
  }
  await exec(
    d,
    `INSERT INTO enrollments (id, createdAt, updatedAt, userId, programId, coachId, currentDay, completedDaysJson)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [e.id, e.createdAt, e.updatedAt, e.userId, e.programId, e.coachId, e.currentDay, e.completedDaysJson],
  )
  return e
}

export async function getEnrollment(userId: string, programId: string): Promise<Enrollment | null> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM enrollments WHERE userId = ? AND programId = ? LIMIT 1;`, [userId, programId])
  return rows[0] ? rowToEnrollment(rows[0]) : null
}

export async function listMyEnrollments(userId: string): Promise<Enrollment[]> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM enrollments WHERE userId = ? ORDER BY updatedAt DESC;`, [userId])
  return rows.map(rowToEnrollment)
}

export async function markProgramDayComplete(input: { userId: string; programId: string; day: number }): Promise<Enrollment | null> {
  const d = await getDb()
  const e = await getEnrollment(input.userId, input.programId)
  if (!e) return null
  const completed = new Set(parseCompletedDays(e.completedDaysJson))
  completed.add(input.day)
  const nextDay = Math.max(e.currentDay, input.day + 1)
  const now = Date.now()
  await exec(
    d,
    `UPDATE enrollments SET updatedAt = ?, currentDay = ?, completedDaysJson = ? WHERE id = ?;`,
    [now, nextDay, JSON.stringify([...completed].sort((a, b) => a - b)), e.id],
  )
  const rows = await query<any>(d, `SELECT * FROM enrollments WHERE id = ? LIMIT 1;`, [e.id])
  return rows[0] ? rowToEnrollment(rows[0]) : null
}