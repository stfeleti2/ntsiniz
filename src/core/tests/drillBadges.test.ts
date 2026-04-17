import test from "node:test"
import assert from "node:assert/strict"
import { buildDrillBadges } from "../share/drillBadges"

test("buildDrillBadges includes PB + accuracy/stability", () => {
  const attempt: any = {
    id: "att1",
    createdAt: 1,
    sessionId: "s1",
    drillId: "d1",
    score: 88,
    metrics: {
      drillType: "sustain",
      avgAbsCents: 9,
      wobbleCents: 8,
      voicedRatio: 0.9,
      timeToEnterMs: 800,
    },
  }

  const b = buildDrillBadges({ attempt, bestScoreBefore: 80 })
  const texts = b.map((x) => x.text)
  assert.ok(texts.includes("New personal best"))
  assert.ok(texts.includes("Accuracy elite"))
  assert.ok(texts.includes("Rock solid"))
})

test("buildDrillBadges includes interval nailed when close", () => {
  const attempt: any = {
    id: "att2",
    createdAt: 1,
    sessionId: "s1",
    drillId: "d2",
    score: 75,
    metrics: {
      drillType: "interval",
      intervalErrorCents: 12,
      intervalDirectionCorrect: true,
      avgAbsCents: 16,
      wobbleCents: 14,
      voicedRatio: 0.8,
      timeToEnterMs: 1300,
    },
  }

  const b = buildDrillBadges({ attempt, bestScoreBefore: 80 })
  assert.ok(b.some((x) => x.text === "Interval nailed"))
})
