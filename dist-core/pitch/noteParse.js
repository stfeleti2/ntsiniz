"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNoteToMidi = parseNoteToMidi;
/**
 * Parse note names like:
 *  - A4, C#3, Db4, F-1
 * Returns MIDI number (integer semitone).
 */
function parseNoteToMidi(note) {
    const s = String(note).trim();
    const m = s.match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
    if (!m)
        return null;
    const letter = m[1].toUpperCase();
    const accidental = m[2];
    const octave = Number.parseInt(m[3], 10);
    if (!Number.isFinite(octave))
        return null;
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    let semi = base[letter];
    if (semi == null)
        return null;
    if (accidental === "#")
        semi += 1;
    if (accidental === "b")
        semi -= 1;
    // MIDI: C-1 = 0 => (octave + 1) * 12 + semitone
    return (octave + 1) * 12 + semi;
}
