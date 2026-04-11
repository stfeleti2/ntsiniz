import test from "node:test"
import assert from "node:assert/strict"
import { hzToNote, hzToMidi, midiToHz } from "../pitch/hzToNote"

test("hzToNote 440Hz -> A4", () => {
  const n = hzToNote(440)
  assert.equal(n.note, "A4")
  assert.ok(Math.abs(n.cents) < 1)
})

test("midiToHz/hzToMidi roundtrip", () => {
  const midi = hzToMidi(261.625565) // C4
  assert.ok(Math.abs(midi - 60) < 0.01)
  const hz = midiToHz(60)
  assert.ok(Math.abs(hz - 261.625565) < 0.2)
})
