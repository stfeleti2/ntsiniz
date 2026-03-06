import test from "node:test"
import assert from "node:assert/strict"
import { scoreAttempt } from "../scoring/drillScoring.js"

test("interval scoring rewards correct interval", () => {
  const base = {
    drillType: "interval",
    tuneWindowCents: 25,
    holdMs: 900,
    timeToEnterMs: 1500,
    meanCents: 3,
    avgAbsCents: 14,
    wobbleCents: 10,
    voicedRatio: 0.9,
    confidenceAvg: 0.9,
  }

  const good = scoreAttempt({ ...base, intervalErrorCents: 12 })
  const bad = scoreAttempt({ ...base, intervalErrorCents: 180 })
  assert.ok(good > bad)
  assert.ok(good >= 70)
})
