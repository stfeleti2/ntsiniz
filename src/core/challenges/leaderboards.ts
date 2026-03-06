import { listSubmissionsForChallenge } from '@/core/social/submissionsRepo'
import { isPersonBlocked } from '@/core/social/peopleRepo'
import type { ChallengeSubmission } from '@/core/social/types'

export async function getLeaderboard(input: { period: 'daily' | 'weekly'; periodKey: string; challengeId: string }): Promise<ChallengeSubmission[]> {
  const subs = await listSubmissionsForChallenge(input)
  const out: ChallengeSubmission[] = []
  for (const s of subs) {
    if (await isPersonBlocked(s.userId).catch(() => false)) continue
    out.push(s)
  }
  return out
}
