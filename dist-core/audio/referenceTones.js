"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playReferenceForDrill = playReferenceForDrill;
const hzToNote_1 = require("@/core/pitch/hzToNote");
const noteParse_1 = require("@/core/pitch/noteParse");
const tonePlayer_1 = require("./tonePlayer");
function noteToHz(n) {
    if (typeof n.hz === "number" && Number.isFinite(n.hz))
        return n.hz;
    const midi = (0, noteParse_1.parseNoteToMidi)(n.note);
    return midi == null ? 440 : (0, hzToNote_1.midiToHz)(midi);
}
async function playReferenceForDrill(drill) {
    // Default timings tuned for quick “copy this” listening.
    const dur = 450;
    const gap = 160;
    // Song-adjacent drills: add a quick tonic "bed" so melodies feel musical.
    const isSong = drill.id?.startsWith('song_');
    if (drill.type === "melody_echo" && drill.melody?.length) {
        const melody = drill.melody.map((n) => ({ freqHz: noteToHz(n), durationMs: dur, gapMs: gap }));
        if (isSong) {
            const tonic = melody[0]?.freqHz ?? 440;
            const bed = [{ freqHz: tonic / 2, durationMs: 650, gapMs: 120 }];
            return (0, tonePlayer_1.playToneSequence)([...bed, ...melody], { volume: 0.95 });
        }
        return (0, tonePlayer_1.playToneSequence)(melody, { volume: 0.95 });
    }
    if (drill.type === "interval" && drill.target?.note && typeof drill.intervalSemitones === "number") {
        const startMidi = (0, noteParse_1.parseNoteToMidi)(drill.target.note) ?? 69;
        const endMidi = startMidi + drill.intervalSemitones;
        return (0, tonePlayer_1.playToneSequence)([
            { freqHz: (0, hzToNote_1.midiToHz)(startMidi), durationMs: dur, gapMs: gap },
            { freqHz: (0, hzToNote_1.midiToHz)(endMidi), durationMs: dur, gapMs: 0 },
        ], { volume: 0.95 });
    }
    if (drill.type === "slide" && drill.from?.note && drill.to?.note) {
        const from = (0, noteParse_1.parseNoteToMidi)(drill.from.note) ?? 69;
        const to = (0, noteParse_1.parseNoteToMidi)(drill.to.note) ?? 69;
        return (0, tonePlayer_1.playToneSequence)([
            { freqHz: (0, hzToNote_1.midiToHz)(from), durationMs: dur, gapMs: gap },
            { freqHz: (0, hzToNote_1.midiToHz)(to), durationMs: dur, gapMs: 0 },
        ], { volume: 0.95 });
    }
    const target = drill.target ?? drill.from ?? drill.to;
    if (target) {
        return (0, tonePlayer_1.playToneSequence)([{ freqHz: noteToHz(target), durationMs: 550, gapMs: 0 }], { volume: 0.95 });
    }
}
