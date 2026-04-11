import test from "node:test"
import assert from "node:assert/strict"
import { parseNoteToMidi } from "../pitch/noteParse"

test("parseNoteToMidi parses sharps/flats", () => {
  assert.equal(parseNoteToMidi("C4"), 60)
  assert.equal(parseNoteToMidi("A4"), 69)
  assert.equal(parseNoteToMidi("C#4"), 61)
  assert.equal(parseNoteToMidi("Db4"), 61)
  assert.equal(parseNoteToMidi("F-1"), 5)
})
