"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildScoreBreakdown = buildScoreBreakdown;
/**
 * Explainable scoring (approximate):
 * We don’t re-score; we translate metrics into human-readable “sub-scores”.
 */
function buildScoreBreakdown(metrics, overallScore) {
    const m = metrics ?? {};
    const clamp = (x) => Math.max(0, Math.min(100, x));
    const inv = (x, worst) => clamp(100 - (x / worst) * 100);
    const pitch = typeof m.avgAbsCents === 'number' ? inv(Math.abs(m.avgAbsCents), 80) : clamp(overallScore);
    const stability = typeof m.wobbleCents === 'number' ? inv(Math.abs(m.wobbleCents), 60) : clamp(overallScore);
    const timing = typeof m.timeToEnterMs === 'number' ? inv(Math.abs(m.timeToEnterMs), 2500) : clamp(overallScore);
    const confidence = typeof m.voicedRatio === 'number' ? clamp(m.voicedRatio * 100) : clamp(70);
    const notes = [];
    if (typeof m.avgAbsCents === 'number')
        notes.push(`Pitch: ~${Math.round(m.avgAbsCents)}c off on average`);
    if (typeof m.wobbleCents === 'number')
        notes.push(`Stability: ~${Math.round(m.wobbleCents)}c wobble`);
    if (typeof m.timeToEnterMs === 'number')
        notes.push(`Timing: locked in ${(m.timeToEnterMs / 1000).toFixed(1)}s`);
    if (typeof m.voicedRatio === 'number')
        notes.push(`Confidence: ${Math.round(m.voicedRatio * 100)}% voiced`);
    return { pitch, stability, timing, confidence, notes };
}
