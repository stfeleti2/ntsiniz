import test from "node:test"
import assert from "node:assert/strict"
import { createSessionPlan, getPlan, advancePlan, markFail } from "../profile/sessionPlan.js"

const pack = {
  packId: "t",
  language: "en",
  drills: [
    { id: "m1", title: "Match", type: "match_note", level: 1, tuneWindowCents: 25, holdMs: 900, countdownMs: 800, target: { note: "A4" } },
    { id: "s1", title: "Sustain", type: "sustain", level: 2, tuneWindowCents: 25, holdMs: 900, countdownMs: 800, target: { note: "A4" } },
    { id: "sl1", title: "Slide", type: "slide", level: 2, tuneWindowCents: 25, holdMs: 900, countdownMs: 800, from: { note: "A4" }, to: { note: "B4" } },
    { id: "i1", title: "Interval", type: "interval", level: 2, tuneWindowCents: 25, holdMs: 900, countdownMs: 800, target: { note: "A4" }, intervalSemitones: 5 },
    { id: "me1", title: "Melody", type: "melody_echo", level: 2, tuneWindowCents: 25, holdMs: 900, countdownMs: 800, melody: [{ note: "A4" }] }
  ]
} as any

test("createSessionPlan makes 3-drill plan", () => {
  const p = createSessionPlan("sess1", pack, "m1")
  assert.equal(p.drillIds.length, 3)
  assert.equal(p.drillIds[0], "m1")
  assert.equal(getPlan("sess1")?.drillIds.length, 3)
})

test("advancePlan increments index", () => {
  createSessionPlan("sess2", pack, "m1")
  const p1 = getPlan("sess2")!
  assert.equal(p1.index, 0)
  advancePlan("sess2")
  const p2 = getPlan("sess2")!
  assert.equal(p2.index, 1)
})

test("markFail increments fail streak", () => {
  createSessionPlan("sess3", pack, "m1")
  markFail("sess3", "m1")
  markFail("sess3", "m1")
  assert.equal(getPlan("sess3")!.failStreakByDrill["m1"], 2)
})
