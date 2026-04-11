"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreSustainHold = void 0;
// V6 curriculum pack companion
const pitch_math_1 = require("./pitch_math");
const bandFromScore = (score) => {
    if (score >= 90)
        return "excellent";
    if (score >= 80)
        return "pass_strong";
    if (score >= 70)
        return "pass";
    if (score >= 60)
        return "near_pass";
    if (score >= 45)
        return "needs_help";
    return "retry";
};
const validFrames = (frames) => frames.filter((frame) => frame.voiced &&
    frame.pitchConfidence >= 0.45 &&
    !frame.isReferencePlayback &&
    !frame.isRecoveryState);
const scoreSustainHold = (frames, config) => {
    const usable = validFrames(frames);
    const absErrors = usable.map((f) => (0, pitch_math_1.absCentsError)(f.smoothedHz, f.targetHz)).filter(Number.isFinite);
    const accuracies = absErrors.map(pitch_math_1.frameAccuracy);
    const meanAbs = (0, pitch_math_1.mean)(absErrors);
    const stability = (0, pitch_math_1.clamp)(1 - (0, pitch_math_1.stdDev)(absErrors) / 35, 0, 1);
    const heldDurationMs = usable.length * 20; // assumes 20 ms frames
    const targetHoldMs = config.targetHoldMs ?? 3000;
    const hold = (0, pitch_math_1.clamp)(heldDurationMs / targetHoldMs, 0, 1);
    const zone = (0, pitch_math_1.clamp)(usable.filter((f) => (0, pitch_math_1.absCentsError)(f.smoothedHz, f.targetHz) <= 25).length * 20 / targetHoldMs, 0, 1);
    const voicedRatioMetric = (0, pitch_math_1.voicedScore)(usable.length / Math.max(frames.length, 1));
    const meanConfidence = (0, pitch_math_1.mean)(usable.map((f) => f.pitchConfidence));
    const confidenceMetric = (0, pitch_math_1.confidenceScore)(meanConfidence);
    const raw = 0.25 * (0, pitch_math_1.mean)(accuracies) +
        0.30 * stability +
        0.25 * hold +
        0.10 * zone +
        0.10 * voicedRatioMetric;
    let finalScore = Math.round(raw * 100);
    const cap = (0, pitch_math_1.confidenceCap)(meanConfidence);
    if (cap !== null)
        finalScore = Math.min(finalScore, cap);
    if (heldDurationMs < targetHoldMs * 0.5)
        finalScore = Math.min(finalScore, 64);
    if (usable.length / Math.max(frames.length, 1) < 0.4)
        finalScore = Math.min(finalScore, 54);
    return {
        finalScore,
        passed: finalScore >= config.passThreshold,
        band: bandFromScore(finalScore),
        metrics: {
            meanAbsCents: meanAbs,
            stabilityStdDevCents: (0, pitch_math_1.stdDev)(absErrors),
            heldDurationMs,
            targetHoldMs,
            meanConfidence,
            confidenceMetric
        },
        diagnosisTags: []
    };
};
exports.scoreSustainHold = scoreSustainHold;
