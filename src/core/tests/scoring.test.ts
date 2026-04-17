import test from "node:test"
import assert from "node:assert/strict"
import { scoreAttempt } from "../scoring/drillScoring"

test("scoreAttempt: good attempt scores high", () => {
  const score = scoreAttempt({
    drillType: "match_note",
    tuneWindowCents: 25,
    holdMs: 900,
    timeToEnterMs: 1200,
    meanCents: 2,
    avgAbsCents: 8,
    wobbleCents: 6,
    driftCentsPerSec: 0.5,
    overshootRate: 0.05,
    voicedRatio: 0.9,
    confidenceAvg: 0.9,
  })
  assert.ok(score >= 80)
})

test("scoreAttempt: poor attempt scores low", () => {
  const score = scoreAttempt({
    drillType: "match_note",
    tuneWindowCents: 25,
    holdMs: 900,
    timeToEnterMs: 6500,
    meanCents: -35,
    avgAbsCents: 55,
    wobbleCents: 30,
    driftCentsPerSec: 8,
    overshootRate: 0.4,
    voicedRatio: 0.3,
    confidenceAvg: 0.3,
  })
  assert.ok(score <= 45)
})
