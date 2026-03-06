"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPerformanceGhostPlan = getPerformanceGhostPlan;
const noteParse_1 = require("@/core/pitch/noteParse");
function seg(startMs, endMs, note) {
    return { startMs, endMs, midi: (0, noteParse_1.parseNoteToMidi)(note) ?? 69 };
}
/**
 * Small “game feel” plans per template.
 * These are intentionally simple and forgiving — the Ghost Guide is a coach, not a judge.
 */
function getPerformanceGhostPlan(templateId) {
    // Default: steady target (keeps it useful for any song).
    if (templateId === 'clip.pitchlock.15') {
        return {
            toleranceCents: 25,
            segments: [
                seg(0, 15000, 'A4'),
            ],
        };
    }
    if (templateId === 'clip.stability.20') {
        return {
            toleranceCents: 28,
            segments: [
                seg(0, 6500, 'A4'),
                seg(6500, 12500, 'B4'),
                seg(12500, 20000, 'A4'),
            ],
        };
    }
    // “Phrase” contour: gentle arc (Aurora vibe)
    return {
        toleranceCents: 28,
        segments: [
            seg(0, 3000, 'A4'),
            seg(3000, 6000, 'C5'),
            seg(6000, 9000, 'B4'),
            seg(9000, 12000, 'D5'),
            seg(12000, 15000, 'C5'),
        ],
    };
}
