"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRO_CENTS_BANDS = exports.BEGINNER_CENTS_BANDS = exports.STANDARD_CENTS_BANDS = void 0;
exports.bandForCentsError = bandForCentsError;
exports.bandScore = bandScore;
exports.STANDARD_CENTS_BANDS = {
    perfect: 15,
    great: 25,
    good: 40,
    ok: 50,
    miss: 9999,
};
exports.BEGINNER_CENTS_BANDS = {
    perfect: 25,
    great: 35,
    good: 50,
    ok: 60,
    miss: 9999,
};
exports.PRO_CENTS_BANDS = {
    perfect: 10,
    great: 18,
    good: 30,
    ok: 35,
    miss: 9999,
};
function bandForCentsError(absCents, opts) {
    const confidence = opts?.confidence;
    const minConfidence = opts?.minConfidence ?? 0.55;
    if (typeof confidence === 'number' && confidence < minConfidence)
        return 'noread';
    const b = opts?.bands ?? exports.STANDARD_CENTS_BANDS;
    if (!isFinite(absCents))
        return 'noread';
    if (absCents <= b.perfect)
        return 'perfect';
    if (absCents <= b.great)
        return 'great';
    if (absCents <= b.good)
        return 'good';
    if (absCents <= b.ok)
        return 'ok';
    return 'miss';
}
function bandScore(band) {
    switch (band) {
        case 'perfect':
            return 1.0;
        case 'great':
            return 0.85;
        case 'good':
            return 0.7;
        case 'ok':
            return 0.5;
        case 'miss':
            return 0.0;
        case 'noread':
        default:
            return 0.0;
    }
}
