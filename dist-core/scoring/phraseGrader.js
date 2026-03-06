"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradePhraseFromMetrics = gradePhraseFromMetrics;
const bands_1 = require("./bands");
function clamp01(x) {
    return Math.max(0, Math.min(1, x));
}
function bandsForDifficulty(d) {
    if (d === 'beginner')
        return bands_1.BEGINNER_CENTS_BANDS;
    if (d === 'pro')
        return bands_1.PRO_CENTS_BANDS;
    return bands_1.STANDARD_CENTS_BANDS;
}
/**
 * Grades a phrase using aggregate metrics.
 *
 * This is designed to work with both drill attempts and performance clips
 * where we typically store summary metrics instead of full per-frame traces.
 */
function gradePhraseFromMetrics(metrics, opts) {
    const m = metrics ?? {};
    const bands = opts?.bands ?? bandsForDifficulty(opts?.difficulty);
    const avgAbsCents = typeof m.avgAbsCents === 'number' ? Math.abs(m.avgAbsCents) : NaN;
    const wobbleCents = typeof m.wobbleCents === 'number' ? Math.abs(m.wobbleCents) : NaN;
    const voicedRatio = typeof m.voicedRatio === 'number' ? m.voicedRatio : NaN;
    const timeToEnterMs = typeof m.timeToEnterMs === 'number' ? m.timeToEnterMs : NaN;
    const confidenceAvg = typeof m.confidenceAvg === 'number' ? m.confidenceAvg : undefined;
    // Pitch band
    const pitchBand = (0, bands_1.bandForCentsError)(avgAbsCents, { bands, confidence: confidenceAvg, minConfidence: opts?.minConfidence });
    // Stability band (wobble): treat <= 10c as perfect, <= 18c great, <= 28c good, <= 40 ok.
    const stabilityBands = { perfect: 10, great: 18, good: 28, ok: 40, miss: 9999 };
    const stabilityBand = (0, bands_1.bandForCentsError)(wobbleCents, { bands: stabilityBands, confidence: confidenceAvg, minConfidence: opts?.minConfidence });
    // Voiced band: % of frames that were confidently voiced
    const voicedBand = !isFinite(voicedRatio) ? 'noread' : voicedRatio >= 0.82 ? 'perfect' : voicedRatio >= 0.72 ? 'great' : voicedRatio >= 0.6 ? 'good' : voicedRatio >= 0.45 ? 'ok' : 'miss';
    // Timing band: time-to-enter; forgiving because drills differ
    const timingBand = !isFinite(timeToEnterMs) ? 'noread' : timeToEnterMs <= 900 ? 'perfect' : timeToEnterMs <= 1400 ? 'great' : timeToEnterMs <= 2200 ? 'good' : timeToEnterMs <= 3200 ? 'ok' : 'miss';
    const pitchScore = (0, bands_1.bandScore)(pitchBand);
    const stabilityScore = (0, bands_1.bandScore)(stabilityBand);
    const voicedScore = (0, bands_1.bandScore)(voicedBand);
    const timingScore = (0, bands_1.bandScore)(timingBand);
    // Weighted, because pitch + stability are the core promise.
    const score = clamp01(pitchScore * 0.45 + stabilityScore * 0.2 + voicedScore * 0.2 + timingScore * 0.15);
    // Labeling: keep it friendly. We only show 4 buckets.
    let label = 'almost';
    if (score >= 0.88 && pitchBand !== 'ok' && pitchBand !== 'miss')
        label = 'perfect';
    else if (score >= 0.74 && pitchBand !== 'miss')
        label = 'clean';
    else if (score >= 0.55)
        label = 'almost';
    else
        label = 'tryAgain';
    // Reason/cue: pick the biggest limiter.
    const limiters = [];
    // Prefer voiced/timing first when they are very low (breath/entry is actionable and reduces frustration).
    limiters.push({ k: 'lowVoiced', c: 'singSteadyVowel', s: 1 - voicedScore });
    limiters.push({ k: 'enterLate', c: 'enterEarlier', s: 1 - timingScore });
    limiters.push({ k: 'unstable', c: 'holdSteady', s: 1 - stabilityScore });
    // If we have signed cents info, sharpen direction
    const signedAvg = typeof m.avgCents === 'number' ? m.avgCents : undefined;
    const direction = typeof signedAvg === 'number' && isFinite(signedAvg) ? (signedAvg > 6 ? 'sharp' : signedAvg < -6 ? 'flat' : undefined) : undefined;
    if (direction === 'sharp')
        limiters.unshift({ k: 'sharp', c: 'aimDown', s: 1 - pitchScore + 0.15 });
    if (direction === 'flat')
        limiters.unshift({ k: 'flat', c: 'aimUp', s: 1 - pitchScore + 0.15 });
    limiters.push({ k: 'nice', c: 'keepGoing', s: 0 });
    limiters.sort((a, b) => b.s - a.s);
    const top = limiters[0];
    return {
        label,
        score,
        bands: { pitch: pitchBand, stability: stabilityBand, voiced: voicedBand, timing: timingBand },
        reasonKey: top.k,
        cueKey: top.c,
    };
}
