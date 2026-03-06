"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hzToMidi = hzToMidi;
exports.midiToHz = midiToHz;
exports.hzToNote = hzToNote;
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function hzToMidi(hz) {
    return 69 + 12 * Math.log2(hz / 440);
}
function midiToHz(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}
function hzToNote(hz) {
    const midiFloat = hzToMidi(hz);
    const midi = Math.round(midiFloat);
    const cents = (midiFloat - midi) * 100;
    const name = NOTE_NAMES[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;
    return {
        midi,
        note: `${name}${octave}`,
        cents,
    };
}
