import test from "node:test"
import assert from "node:assert/strict"
import { flowScenarios, viewportWidths } from "@/app/dev/sandbox/scenarios"
import { orderedScreenPreviews } from "@/screens/previews"

test("sandbox flow registry exposes required scenarios", () => {
  const ids = Object.keys(flowScenarios).sort()
  assert.deepEqual(ids, ["onboarding", "signin", "singing-start"])

  for (const id of ids) {
    const scenario = flowScenarios[id as keyof typeof flowScenarios]
    assert.ok(scenario.title.length > 0, `scenario ${id} missing title`)
    assert.ok(scenario.steps.length > 0, `scenario ${id} missing steps`)
  }
})

test("viewport presets include phone and tablet breakpoints", () => {
  assert.equal(viewportWidths["phone-sm"] > 0, true)
  assert.equal(viewportWidths["phone-lg"] > viewportWidths["phone-sm"], true)
  assert.equal(viewportWidths.tablet > viewportWidths["phone-lg"], true)
})

test("screen preview registry covers required flow previews", () => {
  const ids = orderedScreenPreviews.map((entry) => entry.id).sort()
  assert.deepEqual(ids, ["drill", "mic-permission", "playback", "range-finder", "session-summary", "singing-level", "welcome"])
})
