const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const

export type NoteInfo = {
  midi: number
  note: string
  cents: number // relative to nearest semitone, approx -50..+50
}

export function hzToMidi(hz: number) {
  return 69 + 12 * Math.log2(hz / 440)
}

export function midiToHz(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export function hzToNote(hz: number): NoteInfo {
  const midiFloat = hzToMidi(hz)
  const midi = Math.round(midiFloat)
  const cents = (midiFloat - midi) * 100
  const name = NOTE_NAMES[((midi % 12) + 12) % 12]
  const octave = Math.floor(midi / 12) - 1
  return {
    midi,
    note: `${name}${octave}`,
    cents,
  }
}
