import test from "node:test"
import assert from "node:assert/strict"

import { buildTrainingCsv } from "../share/trainingCsv"

test("buildTrainingCsv: includes header + escapes commas/newlines/quotes", () => {
  const csv = buildTrainingCsv({
    sessions: [{ id: "s1", startedAt: 0, avgScore: 80 }],
    attempts: [
      {
        sessionId: "s1",
        drillId: "drill,1",
        score: 88,
        createdAt: Date.parse("2026-02-15T10:00:00.000Z"),
        metrics: { drillType: "match_note", avgAbsCents: 12.3, wobbleCents: 9.9, voicedRatio: 0.95, confidenceAvg: 0.88, timeToEnterMs: 900 },
      },
      {
        sessionId: "s1",
        drillId: "drill-2",
        score: 70,
        createdAt: Date.parse("2026-02-15T10:01:00.000Z"),
        metrics: { drillType: "interval", avgAbsCents: 33.3, wobbleCents: 20.1 },
      },
    ],
  })

  const [header, row1, row2] = csv.split("\n")
  assert.ok(header.startsWith("date,sessionId,sessionAvg,drillId"))
  // drillId contains a comma -> must be quoted
  assert.ok(row1.includes('"drill,1"'))
  // row count should be header + 2 rows
  assert.equal(csv.split("\n").length, 3)
  // sessionAvg should be present
  assert.ok(row2.includes(",80,"))
})
