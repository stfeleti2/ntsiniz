function csvEscape(v: any) {
  const s = String(v ?? "")
  if (/[\n\r,"]/g.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function buildTrainingCsv(params: {
  sessions: { id: string; startedAt: number; endedAt?: number | null; avgScore: number; attemptCount?: number }[]
  attempts: { sessionId: string; drillId: string; score: number; createdAt: number; metrics?: any }[]
}) {
  const { sessions, attempts } = params

  const sessionById = new Map<string, { startedAt: number; endedAt: number | null; avgScore: number }>()
  for (const s of sessions) {
    sessionById.set(s.id, {
      startedAt: s.startedAt,
      endedAt: s.endedAt ?? null,
      avgScore: Math.round(s.avgScore),
    })
  }

  const header = [
    "date",
    "sessionId",
    "sessionAvg",
    "drillId",
    "drillType",
    "score",
    "avgAbsCents",
    "wobbleCents",
    "voicedRatio",
    "confidenceAvg",
    "timeToEnterMs",
  ]

  const rows = attempts.map((a) => {
    const s = sessionById.get(a.sessionId)
    const date = new Date(a.createdAt).toISOString()
    const m = a.metrics ?? {}
    return [
      date,
      a.sessionId,
      s ? s.avgScore : "",
      a.drillId,
      m.drillType ?? "",
      a.score,
      m.avgAbsCents ?? "",
      m.wobbleCents ?? "",
      m.voicedRatio ?? "",
      m.confidenceAvg ?? "",
      m.timeToEnterMs ?? "",
    ]
  })

  return [header.join(","), ...rows.map((r) => r.map(csvEscape).join(","))].join("\n")
}
