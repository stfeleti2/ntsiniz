import type { Drill, NoteTarget } from "@/core/drills/schema"
import { midiToHz } from "@/core/pitch/hzToNote"
import { parseNoteToMidi } from "@/core/pitch/noteParse"
import { playToneSequence } from "./tonePlayer"

function noteToHz(n: NoteTarget) {
  if (typeof n.hz === "number" && Number.isFinite(n.hz)) return n.hz
  const midi = parseNoteToMidi(n.note)
  return midi == null ? 440 : midiToHz(midi)
}

export async function playReferenceForDrill(drill: Drill) {
  // Default timings tuned for quick “copy this” listening.
  const dur = 450
  const gap = 160

  // Song-adjacent drills: add a quick tonic "bed" so melodies feel musical.
  const isSong = drill.id?.startsWith('song_')

  if (drill.type === "melody_echo" && drill.melody?.length) {
    const melody = drill.melody.map((n) => ({ freqHz: noteToHz(n), durationMs: dur, gapMs: gap }))
    if (isSong) {
      const tonic = melody[0]?.freqHz ?? 440
      const bed = [{ freqHz: tonic / 2, durationMs: 650, gapMs: 120 }]
      return playToneSequence([...bed, ...melody], { volume: 0.95 })
    }
    return playToneSequence(melody, { volume: 0.95 })
  }

  if (drill.type === "interval" && drill.target?.note && typeof drill.intervalSemitones === "number") {
    const startMidi = parseNoteToMidi(drill.target.note) ?? 69
    const endMidi = startMidi + drill.intervalSemitones
    return playToneSequence(
      [
        { freqHz: midiToHz(startMidi), durationMs: dur, gapMs: gap },
        { freqHz: midiToHz(endMidi), durationMs: dur, gapMs: 0 },
      ],
      { volume: 0.95 },
    )
  }

  if (drill.type === "slide" && drill.from?.note && drill.to?.note) {
    const from = parseNoteToMidi(drill.from.note) ?? 69
    const to = parseNoteToMidi(drill.to.note) ?? 69
    return playToneSequence(
      [
        { freqHz: midiToHz(from), durationMs: dur, gapMs: gap },
        { freqHz: midiToHz(to), durationMs: dur, gapMs: 0 },
      ],
      { volume: 0.95 },
    )
  }

  const target = drill.target ?? drill.from ?? drill.to
  if (target) {
    return playToneSequence([{ freqHz: noteToHz(target), durationMs: 550, gapMs: 0 }], { volume: 0.95 })
  }
}
