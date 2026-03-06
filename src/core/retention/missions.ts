import { listAttemptsInRange } from '@/core/storage/attemptsRepo'
import { listClipsInRange } from '@/core/performance/clipsRepo'
import { query, getDb } from '@/core/storage/db'
import { gradePhraseFromMetrics } from '@/core/scoring/phraseGrader'
import { dayKey, startOfDayMs, weekKey, weekRangeMs } from '@/core/time/keys'
import { getRetentionState } from './stateRepo'
import { listSessionAggregatesInRange } from '@/core/storage/sessionsRepo'

export type MissionId = 'cleanPhrase' | 'shareWin' | 'postOrReply'

export type Mission = {
  id: MissionId
  title: string
  subtitle: string
  done: boolean
  /** optional progress for UI (0..1) */
  pct?: number
  cta?: { kind: 'startSession' | 'openCommunity' | 'shareLatest' | 'openBilling'; label: string }
}

export type WeeklyGoal = {
  key: string
  goalSessions: number
  doneSessions: number
  pct: number
}

async function hasPostToday(startMs: number, endMs: number): Promise<boolean> {
  const d = await getDb()
  // self-authored posts (offline) are stored with source=self and authorId=self person id.
  const rows = await query<any>(
    d,
    `SELECT COUNT(1) as c FROM posts WHERE createdAt >= ? AND createdAt < ? AND source = 'self' AND hidden = 0;`,
    [startMs, endMs],
  )
  return Number(rows?.[0]?.c ?? 0) > 0
}

export async function getDailyMissions(nowMs = Date.now()): Promise<{ dayKey: string; missions: Mission[]; weekly: WeeklyGoal }> {
  const startMs = startOfDayMs(nowMs)
  const endMs = startMs + 86400000
  const dk = dayKey(nowMs)
  const wk = weekKey(nowMs)

  // Evaluate "Clean phrase" from attempts + clips today.
  const attempts = await listAttemptsInRange(startMs, endMs).catch(() => [])
  const clips = await listClipsInRange(startMs, endMs).catch(() => [])
  const grades = [
    ...attempts.map((a) => gradePhraseFromMetrics(a.metrics, { difficulty: 'standard' })),
    ...clips.map((c) => gradePhraseFromMetrics(c.metrics, { difficulty: 'standard' })),
  ]
  const cleanCount = grades.filter((g) => g.label === 'perfect' || g.label === 'clean').length
  const cleanDone = cleanCount > 0

  const retention = await getRetentionState().catch(() => ({} as any))
  const sharedWin = retention?.dailyKey === dk ? !!retention?.daily?.sharedWin : false

  const posted = await hasPostToday(startMs, endMs).catch(() => false)

  // Weekly goal: sessions with attempts.
  const wr = weekRangeMs(nowMs)
  const rows = await listSessionAggregatesInRange(wr.startMs, wr.endMs).catch(() => [])
  const doneSessions = rows.filter((r) => r.attemptCount > 0).length
  const goalSessions = Math.max(1, Math.min(14, Number(retention?.weekly?.goalSessions ?? 5)))
  const weekly: WeeklyGoal = { key: wk, goalSessions, doneSessions, pct: Math.round((Math.min(1, doneSessions / goalSessions)) * 100) }

  const missions: Mission[] = [
    {
      id: 'cleanPhrase',
      title: 'Get 1 Clean phrase',
      subtitle: 'Hit “Clean” or “Perfect” once today.',
      done: cleanDone,
      pct: Math.max(0, Math.min(1, cleanCount / 1)),
      cta: cleanDone ? undefined : { kind: 'startSession', label: 'Start a quick session' },
    },
    {
      id: 'shareWin',
      title: 'Share a win',
      subtitle: 'Share your best take, clip, or score today.',
      done: sharedWin,
      cta: sharedWin ? undefined : { kind: 'shareLatest', label: 'Share your latest' },
    },
    {
      id: 'postOrReply',
      title: 'Show up in Community',
      subtitle: 'Post once (or reply to someone).',
      done: posted,
      cta: posted ? undefined : { kind: 'openCommunity', label: 'Open Community' },
    },
  ]

  return { dayKey: dk, missions, weekly }
}
