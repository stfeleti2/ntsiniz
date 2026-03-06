import { listAttemptsBySession } from '@/core/storage/attemptsRepo'
import { getSessionMeta } from '@/core/profile/sessionMeta'
import { ensureSelfPerson } from '@/core/social/peopleRepo'
import { upsertSubmission } from '@/core/social/submissionsRepo'
import { getDailyChallenge } from './dailyChallenge'
import { isoDate } from '@/core/curriculum/progress'
import { getWeeklyChallengeById } from './weeklyChallenges'
import { getIsoWeekKey } from '@/core/time/week'

function bestScoreForDrill(attempts: { drillId: string; score: number }[], drillId: string): number | null {
  let best: number | null = null
  for (const a of attempts) {
    if (a.drillId !== drillId) continue
    if (best == null || a.score > best) best = a.score
  }
  return best
}

export async function finalizeChallengeSubmissionsForSession(sessionId: string, now = Date.now()) {
  const meta = getSessionMeta(sessionId)
  if (!meta) return

  const me = await ensureSelfPerson()
  const attempts = await listAttemptsBySession(sessionId).catch(() => [])

  // Daily challenge submission
  if (meta.dailyChallenge) {
    const c = getDailyChallenge(now)
    const best = bestScoreForDrill(attempts, c.drillId)
    if (best != null) {
      await upsertSubmission({
        period: 'daily',
        periodKey: isoDate(now),
        challengeId: c.id,
        userId: me.id,
        displayName: me.displayName,
        score: best,
        details: { drillId: c.drillId, title: c.title, target: c.targetScore },
        source: 'self',
        expiresAt: now + 21 * 86400000,
      })
    }
  }

  // Weekly challenge submission
  if (meta.weeklyChallengeId) {
    const wk = getWeeklyChallengeById(meta.weeklyChallengeId)
    if (wk) {
      const bestByDrill: Record<string, number> = {}
      let sum = 0
      let count = 0
      for (const id of wk.drillIds) {
        const best = bestScoreForDrill(attempts, id)
        if (best != null) {
          bestByDrill[id] = best
          sum += best
          count += 1
        }
      }
      const avg = count ? sum / count : 0
      const periodKey = meta.weeklyPeriodKey ?? getIsoWeekKey(now)
      await upsertSubmission({
        period: 'weekly',
        periodKey,
        challengeId: wk.id,
        userId: me.id,
        displayName: me.displayName,
        score: avg,
        details: {
          title: wk.title,
          subtitle: wk.subtitle,
          drillIds: wk.drillIds,
          completed: count,
          total: wk.drillIds.length,
          bestByDrill,
          targetAvg: wk.targetAvg,
        },
        source: 'self',
        expiresAt: now + 60 * 86400000,
      })
    }
  }
}
