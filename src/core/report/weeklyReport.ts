import { loadAllBundledPacks } from "@/core/drills/loader"
import { computeWeeklyReport as computeWeeklyMetrics } from "@/core/progress/weekly"
import type { WeeklyReport } from "@/core/progress/types"
import { listAttemptsInRange } from "@/core/storage/attemptsRepo"
import type { SessionAggregateRow } from "@/core/storage/sessionsRepo"
import type { WeeklyReportCardStats } from "@/core/share/weeklyReportTypes"

type Params = {
  aggs: SessionAggregateRow[]
  endMs: number
}

export type WeeklyReportView = {
  report: WeeklyReport
  cardStats: WeeklyReportCardStats
}

function startOfISOWeekMs(ts: number) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  const day = (d.getDay() + 6) % 7 // Mon=0
  d.setDate(d.getDate() - day)
  return d.getTime()
}

function addDaysMs(ts: number, days: number) {
  return ts + days * 24 * 60 * 60 * 1000
}

function fmtRange(startMs: number, endMsExclusive: number) {
  const s = new Date(startMs)
  const e = new Date(addDaysMs(endMsExclusive, -1))
  const a = s.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  const b = e.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  return `${a}–${b}`
}

function typeLabel(type: string) {
  switch (type) {
    case "match_note":
      return "Match"
    case "sustain":
      return "Sustain"
    case "slide":
      return "Slide"
    case "interval":
      return "Intervals"
    case "melody_echo":
      return "Melody"
    default:
      return type
  }
}

function typeEmoji(type: string) {
  switch (type) {
    case "match_note":
      return "🎯"
    case "sustain":
      return "🧘"
    case "slide":
      return "🧊"
    case "interval":
      return "🎶"
    case "melody_echo":
      return "🎼"
    default:
      return "✨"
  }
}

function drillTitle(drillId: string) {
  try {
    const pack = loadAllBundledPacks()
    const d = pack.drills.find((x) => x.id === drillId)
    return d?.title ?? drillId
  } catch {
    return drillId
  }
}

function buildBadges(r: WeeklyReport) {
  const b: { emoji: string; text: string }[] = []

  if (r.bestStreakDays >= 2) b.push({ emoji: "🔥", text: `${r.bestStreakDays}-day streak` })

  if (r.mostImprovedLabel && typeof r.mostImprovedDelta === "number" && r.mostImprovedDelta >= 3) {
    b.push({ emoji: "🚀", text: `Most improved: ${drillTitle(r.mostImprovedLabel)} +${r.mostImprovedDelta}` })
  }

  if (typeof r.wobbleDeltaCents === "number" && r.wobbleDeltaCents >= 1) {
    b.push({ emoji: "🧘", text: `Stability up (-${r.wobbleDeltaCents.toFixed(1)}c)` })
  }

  if (typeof r.accuracyDeltaCents === "number" && r.accuracyDeltaCents >= 1) {
    b.push({ emoji: "🎯", text: `Accuracy up (-${r.accuracyDeltaCents.toFixed(1)}c)` })
  }

  if (typeof r.voicedDeltaRatio === "number" && r.voicedDeltaRatio >= 0.05) {
    b.push({ emoji: "🎤", text: `Voice +${Math.round(r.voicedDeltaRatio * 100)}%` })
  }

  if (typeof r.speedDeltaMs === "number" && r.speedDeltaMs >= 500) {
    b.push({ emoji: "⚡", text: `Faster entry (-${Math.round(r.speedDeltaMs / 1000)}s)` })
  }

  if (typeof r.vsPrevWeekDelta === "number" && Math.abs(r.vsPrevWeekDelta) >= 3) {
    b.push({ emoji: r.vsPrevWeekDelta >= 0 ? "📈" : "📉", text: `${r.vsPrevWeekDelta >= 0 ? "+" : ""}${r.vsPrevWeekDelta} vs last week` })
  }

  if (typeof r.bestScore === "number" && r.bestScore >= 85) {
    b.push({ emoji: "🏆", text: `Peak session ${Math.round(r.bestScore)}` })
  }

  return b.slice(0, 6)
}

function topDrills(r: WeeklyReport) {
  const top = r.drillTypeBreakdown
    .slice(0, 5)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 3)
    .map((d) => {
      const delta = typeof d.delta === "number" && Math.abs(d.delta) >= 2 ? ` ${d.delta > 0 ? "+" : ""}${d.delta}` : ""
      return { text: `${typeEmoji(d.type)} ${typeLabel(d.type)} ${Math.round(d.avgScore)}${delta}` }
    })
  return top
}

export async function computeWeeklyReport(params: Params): Promise<WeeklyReportView> {
  const weekStartMs = startOfISOWeekMs(params.endMs)
  const weekEndMs = addDaysMs(weekStartMs, 7)
  const prevStartMs = addDaysMs(weekStartMs, -7)
  const prevEndMs = weekStartMs

  const attempts = await listAttemptsInRange(weekStartMs, weekEndMs)
  const prevAttempts = await listAttemptsInRange(prevStartMs, prevEndMs)

  const report = computeWeeklyMetrics({
    weekStartMs,
    aggs: params.aggs,
    attempts,
    prevAttempts,
  })

  const weekLabel = fmtRange(report.weekStartMs, report.weekEndMs)

  const daily = report.dailyAverages.map((d) => d.avgScore)

  const cardStats: WeeklyReportCardStats = {
    weekLabel,
    sessions: report.sessions,
    activeDays: report.activeDays,
    minutesTrained: report.minutesTrained,
    bestStreakDays: report.bestStreakDays,
    avgScore: report.avgScore,
    bestScore: report.bestScore,
    vsPrevWeekDelta: report.vsPrevWeekDelta,
    insight: report.topInsight,
    badges: buildBadges(report),
    topDrills: topDrills(report),
    dailyAverages: daily,
  }

  return { report, cardStats }
}
