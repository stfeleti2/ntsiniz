import type { FeedbackPlan } from '@/core/coaching/feedbackPolicy'

export type SessionMeta = {
  /** Curriculum day id when session is started from a curriculum day. */
  curriculumDayId?: string
  /** Optional micro-lesson id shown for the day. */
  lessonId?: string
  /** Training track in effect (when using pro regimen tracks). */
  track?: 'beginner' | 'intermediate' | 'advanced'
  /** Curriculum week/day used for progressive coaching rules. */
  week?: number
  day?: number
  /** Lesson-authored base feedback plan (optional). */
  baseFeedbackPlan?: Partial<FeedbackPlan>
  /** Resolved feedback plan for the current drill segment (optional legacy). */
  feedbackPlan?: FeedbackPlan

  dailyChallenge?: boolean
  weeklyChallengeId?: string
  weeklyPeriodKey?: string

  guidedJourney?: {
    routeId: string
    stageId: string
    lessonId: string
    plan: Array<{
      packDrillId: string
      hostDrillId: string
      family: string
      title: string
      supported: boolean
      instructions?: string
    }>
  }
}

const meta = new Map<string, SessionMeta>()

export function setSessionMeta(sessionId: string, m: SessionMeta) {
  meta.set(sessionId, m)
}

export function getSessionMeta(sessionId: string): SessionMeta | null {
  return meta.get(sessionId) ?? null
}

export function clearSessionMeta(sessionId: string) {
  meta.delete(sessionId)
}
