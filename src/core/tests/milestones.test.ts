import test from "node:test"
import assert from "node:assert/strict"
import { computeMilestones } from "../progress/milestones.js"

test("computeMilestones picks baseline/day7/day30 sensibly", () => {
  const day = 24 * 60 * 60 * 1000
  const t0 = Date.UTC(2026, 0, 1, 12, 0, 0) // Jan 1 2026 noon

  const aggs = [
    { id: "s0", startedAt: t0, avgScore: 50, attemptCount: 3 },
    { id: "s1", startedAt: t0 + 6 * day, avgScore: 60, attemptCount: 3 },
    { id: "s2", startedAt: t0 + 7 * day, avgScore: 65, attemptCount: 3 },
    { id: "s3", startedAt: t0 + 31 * day, avgScore: 80, attemptCount: 3 },
  ]

  const ms = computeMilestones(aggs)
  assert.equal(ms.baseline?.score, 50)
  assert.equal(ms.latest?.score, 80)

  // Day 7 should be near the 7th day session
  assert.equal(ms.day7?.score, 65)

  // Day 30 target is Jan 31; closest here is day 31
  assert.equal(ms.day30?.score, 80)
})
