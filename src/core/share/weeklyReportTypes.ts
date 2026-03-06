export type WeeklyReportCardStats = {
  weekLabel: string
  sessions: number
  activeDays: number
  minutesTrained: number | null
  bestStreakDays: number
  avgScore: number | null
  bestScore: number | null
  vsPrevWeekDelta: number | null
  insight?: string | null
  badges: { emoji: string; text: string }[]
  topDrills?: { text: string }[]
  dailyAverages: number[]
}
