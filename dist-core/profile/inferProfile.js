"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferProfile = inferProfile;
function inferProfile(attempts) {
    const recent = attempts.slice(0, 80); // already expected sorted desc by caller
    if (!recent.length) {
        return {
            updatedAt: Date.now(),
            biasCents: 0,
            driftCentsPerSec: 0,
            wobbleCents: 0,
            overshootRate: 0,
            voicedRatio: 0,
            confidence: 0,
        };
    }
    const m = (k) => {
        const xs = recent
            .map((a) => a.metrics?.[k])
            .filter((v) => typeof v === "number" && Number.isFinite(v));
        return mean(xs);
    };
    const bias = m("meanCents");
    const drift = m("driftCentsPerSec");
    const wobble = m("wobbleCents");
    const over = m("overshootRate");
    const voiced = m("voicedRatio");
    const n = recent.length;
    const conf = Math.max(0.1, Math.min(1, n / 40));
    return {
        updatedAt: Date.now(),
        biasCents: bias,
        driftCentsPerSec: drift,
        wobbleCents: wobble,
        overshootRate: over,
        voicedRatio: voiced,
        confidence: conf,
    };
}
function mean(xs) {
    if (!xs.length)
        return 0;
    return xs.reduce((a, b) => a + b, 0) / xs.length;
}
