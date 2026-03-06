import { getDb, exec, query } from '@/core/storage/db'
import { id as makeId } from '@/core/util/id'
import { enqueueUpsert, enqueueHide } from '@/core/cloud/enqueue'
import type { ChallengeSubmission } from './types'

function rowToSubmission(r: any): ChallengeSubmission {
  return {
    id: r.id,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    period: r.period,
    periodKey: r.periodKey,
    challengeId: r.challengeId,
    userId: r.userId,
    displayName: r.displayName,
    score: Number(r.score) || 0,
    details: safeParse(r.details),
    source: r.source,
    expiresAt: r.expiresAt ?? null,
    hidden: !!r.hidden,
  }
}

function safeParse(v: any) {
  try {
    return typeof v === 'string' ? JSON.parse(v) : v
  } catch {
    return {}
  }
}

export async function upsertSubmission(input: Omit<ChallengeSubmission, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<ChallengeSubmission> {
  const d = await getDb()
  const now = Date.now()
  const rows = await query<any>(
    d,
    `SELECT * FROM challenge_submissions WHERE period = ? AND periodKey = ? AND challengeId = ? AND userId = ? LIMIT 1;`,
    [input.period, input.periodKey, input.challengeId, input.userId],
  )

  if (rows[0]) {
    const existing = rowToSubmission(rows[0])
    const bestScore = Math.max(existing.score, input.score)
    const details = bestScore === existing.score ? existing.details : input.details
    await exec(
      d,
      `UPDATE challenge_submissions SET score = ?, details = ?, displayName = ?, updatedAt = ?, expiresAt = COALESCE(?, expiresAt), hidden = 0 WHERE id = ?;`,
      [bestScore, JSON.stringify(details ?? {}), input.displayName, now, input.expiresAt ?? null, existing.id],
    )
    const r2 = await query<any>(d, `SELECT * FROM challenge_submissions WHERE id = ? LIMIT 1;`, [existing.id])
    const out = rowToSubmission(r2[0])
    if (out.source === 'self') {
      await enqueueUpsert('submissions', out.id, {
        id: out.id,
        createdAt: out.createdAt,
        updatedAt: out.updatedAt,
        period: out.period,
        periodKey: out.periodKey,
        challengeId: out.challengeId,
        userId: out.userId,
        displayName: out.displayName,
        score: out.score,
        details: out.details ?? {},
        expiresAt: out.expiresAt ?? null,
        hidden: !!out.hidden,
      }, out.updatedAt)
    }
    return out
  }

  const id = input.id ?? makeId('sub')
  await exec(
    d,
    `INSERT INTO challenge_submissions (id, createdAt, updatedAt, period, periodKey, challengeId, userId, displayName, score, details, source, expiresAt, hidden)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
    [
      id,
      now,
      now,
      input.period,
      input.periodKey,
      input.challengeId,
      input.userId,
      input.displayName,
      input.score,
      JSON.stringify(input.details ?? {}),
      input.source,
      input.expiresAt ?? null,
    ],
  )
  const r3 = await query<any>(d, `SELECT * FROM challenge_submissions WHERE id = ? LIMIT 1;`, [id])
  const out = rowToSubmission(r3[0])
  if (out.source === 'self') {
    await enqueueUpsert('submissions', out.id, {
      id: out.id,
      createdAt: out.createdAt,
      updatedAt: out.updatedAt,
      period: out.period,
      periodKey: out.periodKey,
      challengeId: out.challengeId,
      userId: out.userId,
      displayName: out.displayName,
      score: out.score,
      details: out.details ?? {},
      expiresAt: out.expiresAt ?? null,
      hidden: !!out.hidden,
    }, out.updatedAt)
  }
  return out
}

export async function listSubmissionsForChallenge(input: { period: 'daily' | 'weekly'; periodKey: string; challengeId: string }): Promise<ChallengeSubmission[]> {
  const d = await getDb()
  const rows = await query<any>(
    d,
    `SELECT * FROM challenge_submissions WHERE period = ? AND periodKey = ? AND challengeId = ? AND hidden = 0 ORDER BY score DESC, updatedAt DESC;`,
    [input.period, input.periodKey, input.challengeId],
  )
  const now = Date.now()
  return rows
    .map(rowToSubmission)
    .filter((s) => !s.expiresAt || s.expiresAt > now)
}

export async function hideSubmission(id: string) {
  const d = await getDb()
  const now = Date.now()
  await exec(d, `UPDATE challenge_submissions SET hidden = 1, updatedAt = ? WHERE id = ?;`, [now, id])
  const rows = await query<any>(d, `SELECT * FROM challenge_submissions WHERE id = ? LIMIT 1;`, [id])
  if (rows[0]) {
    const out = rowToSubmission(rows[0])
    if (out.source === 'self') {
      await enqueueHide('submissions', out.id, {
        id: out.id,
        createdAt: out.createdAt,
        updatedAt: now,
        period: out.period,
        periodKey: out.periodKey,
        challengeId: out.challengeId,
        userId: out.userId,
        displayName: out.displayName,
        score: out.score,
        details: out.details ?? {},
        expiresAt: out.expiresAt ?? null,
        hidden: true,
      }, now)
    }
  }
}
