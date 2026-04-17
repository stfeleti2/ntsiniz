import test from "node:test"
import assert from "node:assert/strict"
import { computeHeatmapDays } from "../progress/heatmap"

test("computeHeatmapDays returns fixed window with counts", () => {
  const day = 24 * 60 * 60 * 1000
  const end = Date.UTC(2026, 0, 8, 12, 0, 0)
  const startDay = Date.UTC(2026, 0, 6, 0, 0, 0)

  const aggs = [
    { id: "a", startedAt: startDay + 10_000, endedAt: startDay + 70_000, avgScore: 60, attemptCount: 3 },
    { id: "b", startedAt: startDay + day + 10_000, endedAt: startDay + day + 90_000, avgScore: 70, attemptCount: 3 },
  ]

  const out = computeHeatmapDays({ aggs: aggs as any, endMs: end, days: 3 })
  assert.equal(out.length, 3)
  assert.equal(out[0].sessions, 1)
  assert.equal(out[1].sessions, 1)
  assert.equal(out[2].sessions, 0)
})
