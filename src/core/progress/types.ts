export type SessionAggregate = {
  id: string
  startedAt: number
  endedAt?: number | null
  avgScore: number
  attemptCount: number
}

export type MilestonePoint = {
  label: string
  dateMs: number
  score: number
}

export type Milestones = {
  baseline: MilestonePoint | null
  day7: MilestonePoint | null
  day30: MilestonePoint | null
  latest: MilestonePoint | null
  last7Avg: MilestonePoint | null
}

export type WeeklyReport = {
  weekStartMs: number
  weekEndMs: number
  sessions: number
  activeDays: number
  minutesTrained: number | null
  bestStreakDays: number
  currentStreakDays: number
  avgScore: number | null
  bestScore: number | null
  vsPrevWeekDelta: number | null
  mostImprovedLabel: string | null
  mostImprovedDelta: number | null
  wobbleAvgCents: number | null
  wobbleDeltaCents: number | null // prev - this; positive means improved
  // additional proof metrics
  accuracyAvgAbsCents: number | null
  accuracyDeltaCents: number | null // prev - this; positive means improved
  voicedAvgRatio: number | null
  voicedDeltaRatio: number | null // this - prev; positive means improved
  confidenceAvg: number | null
  confidenceDelta: number | null // this - prev; positive means improved
  speedAvgMs: number | null
  speedDeltaMs: number | null // prev - this; positive means improved

  drillTypeBreakdown: { type: string; avgScore: number; delta: number | null; attempts: number }[]
  drillIdBreakdown: { drillId: string; avgScore: number; delta: number | null; attempts: number }[]

  topInsight: string | null
  dailyAverages: { dayMs: number; avgScore: number }[]
}
