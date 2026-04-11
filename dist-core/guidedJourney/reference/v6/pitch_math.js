"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyCents = exports.confidenceCap = exports.confidenceScore = exports.voicedScore = exports.stdDev = exports.mean = exports.frameAccuracy = exports.clamp = exports.absCentsError = exports.centsError = exports.hzToMidi = void 0;
// V6 curriculum pack companion
const hzToMidi = (hz) => {
    if (!Number.isFinite(hz) || hz <= 0)
        return NaN;
    return 69 + 12 * Math.log2(hz / 440);
};
exports.hzToMidi = hzToMidi;
const centsError = (observedHz, targetHz) => {
    if (!Number.isFinite(observedHz) || !Number.isFinite(targetHz) || observedHz <= 0 || targetHz <= 0) {
        return NaN;
    }
    return 1200 * Math.log2(observedHz / targetHz);
};
exports.centsError = centsError;
const absCentsError = (observedHz, targetHz) => Math.abs((0, exports.centsError)(observedHz, targetHz));
exports.absCentsError = absCentsError;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
exports.clamp = clamp;
const frameAccuracy = (absErrorCents) => (0, exports.clamp)(1 - Math.pow(absErrorCents / 60, 1.35), 0, 1);
exports.frameAccuracy = frameAccuracy;
const mean = (values) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
exports.mean = mean;
const stdDev = (values) => {
    if (!values.length)
        return 0;
    const avg = (0, exports.mean)(values);
    const variance = (0, exports.mean)(values.map((v) => (v - avg) ** 2));
    return Math.sqrt(variance);
};
exports.stdDev = stdDev;
const voicedScore = (voicedRatio) => (0, exports.clamp)((voicedRatio - 0.45) / 0.45, 0, 1);
exports.voicedScore = voicedScore;
const confidenceScore = (meanConfidence) => (0, exports.clamp)((meanConfidence - 0.45) / 0.5, 0, 1);
exports.confidenceScore = confidenceScore;
const confidenceCap = (meanConfidence) => {
    if (meanConfidence < 0.35)
        return 45;
    if (meanConfidence < 0.45)
        return 59;
    return null;
};
exports.confidenceCap = confidenceCap;
const classifyCents = (absErrorCents) => {
    if (absErrorCents <= 15)
        return "perfect";
    if (absErrorCents <= 25)
        return "good";
    if (absErrorCents <= 40)
        return "ok";
    if (absErrorCents <= 60)
        return "poor";
    return "miss";
};
exports.classifyCents = classifyCents;
