"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreAttempt = scoreAttempt;
exports.scoreAttemptV2 = scoreAttemptV2;
exports.buildScoreReport = buildScoreReport;
exports.antiFrustrationAdjustments = antiFrustrationAdjustments;
const fin = (v, fallback) => (Number.isFinite(v) ? Number(v) : fallback);
function scoreAttempt(m) {
    // 0..100
    const tuneWindow = fin(m.tuneWindowCents, 50);
    const avgAbs = fin(m.avgAbsCents, 999);
    const wobble = fin(m.wobbleCents, 60);
    const voicedRatio = fin(m.voicedRatio, 0);
    const conf = fin(m.confidenceAvg, 0);
    const accuracy = clamp01(1 - avgAbs / Math.max(1, tuneWindow * 2));
    const stability = clamp01(1 - wobble / 35);
    const voiced = clamp01((voicedRatio - 0.25) / 0.75);
    const confidence = clamp01(conf);
    const speed = m.timeToEnterMs == null ? 0.5 : clamp01(1 - fin(m.timeToEnterMs, 6000) / 6000);
    // drill-specific skill metrics
    const interval = m.intervalErrorCents == null ? null : clamp01(Math.exp(-Math.abs(m.intervalErrorCents) / 80));
    const melody = m.melodyHitRate == null ? null : clamp01(m.melodyHitRate);
    const contour = m.contourHitRate == null ? null : clamp01(m.contourHitRate);
    const glideQuality = m.glideMonotonicity == null && m.glideSmoothness == null
        ? null
        : clamp01(0.55 * (m.glideMonotonicity ?? 0.5) + 0.45 * (m.glideSmoothness ?? 0.5));
    const glideSpeed = m.glideTimeMs == null ? null : clamp01(1 - m.glideTimeMs / 5000);
    const weights = weightsFor(m.drillType);
    const raw = accuracy * weights.accuracy +
        stability * weights.stability +
        speed * weights.speed +
        voiced * weights.voiced +
        confidence * weights.confidence +
        (interval ?? 0) * weights.interval +
        (melody ?? 0) * weights.melody +
        (contour ?? 0) * weights.contour +
        (glideQuality ?? 0) * weights.glide +
        (glideSpeed ?? 0) * weights.glideSpeed;
    const denom = weights.accuracy +
        weights.stability +
        weights.speed +
        weights.voiced +
        weights.confidence +
        weights.interval +
        weights.melody +
        weights.contour +
        weights.glide +
        weights.glideSpeed;
    return Math.round(100 * clamp01(raw / Math.max(1e-6, denom)));
}
/**
 * Adaptive scoring V2: separates "effort" from "accuracy" so beginners feel rewarded
 * even when they're slightly off, while advanced users still get challenged.
 */
function scoreAttemptV2(m) {
    const report = buildScoreReport(m);
    // Accuracy focuses on cents error + drill-specific skill.
    const accuracy = clamp01(0.75 * report.components.accuracy +
        0.15 * (report.components.interval ?? 0) +
        0.10 * (report.components.melody ?? 0));
    // Effort focuses on "showing up": voiced ratio + confidence + stability + speed.
    const effort = clamp01(0.35 * report.components.voiced +
        0.25 * report.components.confidence +
        0.25 * report.components.stability +
        0.15 * report.components.speed);
    // Total leans slightly toward effort early (less punishing), while still anchored by accuracy.
    const total01 = clamp01(0.55 * accuracy + 0.45 * effort);
    return { total: Math.round(total01 * 100), accuracy: Math.round(accuracy * 100), effort: Math.round(effort * 100) };
}
function buildScoreReport(m) {
    const tuneWindow = fin(m.tuneWindowCents, 50);
    const avgAbs = fin(m.avgAbsCents, 999);
    const wobble = fin(m.wobbleCents, 60);
    const voicedRatio = fin(m.voicedRatio, 0);
    const conf = fin(m.confidenceAvg, 0);
    const tte = m.timeToEnterMs == null ? null : fin(m.timeToEnterMs, 6000);
    const accuracy = clamp01(1 - avgAbs / Math.max(1, tuneWindow * 2));
    const stability = clamp01(1 - wobble / 35);
    const voiced = clamp01((voicedRatio - 0.25) / 0.75);
    const confidence = clamp01(conf);
    const speed = tte == null ? 0.5 : clamp01(1 - tte / 6000);
    const interval = m.intervalErrorCents == null ? null : clamp01(Math.exp(-Math.abs(m.intervalErrorCents) / 80));
    const melody = m.melodyHitRate == null ? null : clamp01(m.melodyHitRate);
    const contour = m.contourHitRate == null ? null : clamp01(m.contourHitRate);
    const glideQuality = m.glideMonotonicity == null && m.glideSmoothness == null
        ? null
        : clamp01(0.55 * (m.glideMonotonicity ?? 0.5) + 0.45 * (m.glideSmoothness ?? 0.5));
    const glideSpeed = m.glideTimeMs == null ? null : clamp01(1 - m.glideTimeMs / 5000);
    const weights = weightsFor(m.drillType);
    const raw = accuracy * weights.accuracy +
        stability * weights.stability +
        speed * weights.speed +
        voiced * weights.voiced +
        confidence * weights.confidence +
        (interval ?? 0) * weights.interval +
        (melody ?? 0) * weights.melody +
        (contour ?? 0) * weights.contour +
        (glideQuality ?? 0) * weights.glide +
        (glideSpeed ?? 0) * weights.glideSpeed;
    const denom = weights.accuracy +
        weights.stability +
        weights.speed +
        weights.voiced +
        weights.confidence +
        weights.interval +
        weights.melody +
        weights.contour +
        weights.glide +
        weights.glideSpeed;
    const score = Math.round(100 * clamp01(raw / Math.max(1e-6, denom)));
    return {
        score,
        components: {
            accuracy,
            stability,
            speed,
            voiced,
            confidence,
            interval,
            melody,
            contour,
            glide: glideQuality,
            glideSpeed,
        },
        weights,
    };
}
function weightsFor(type) {
    switch (type) {
        case "sustain":
            return { accuracy: 4, stability: 4, speed: 1, voiced: 2, confidence: 1, interval: 0, melody: 0, contour: 0, glide: 0, glideSpeed: 0 };
        case "slide":
            return { accuracy: 3, stability: 2, speed: 1, voiced: 2, confidence: 1, interval: 0, melody: 0, contour: 0, glide: 3, glideSpeed: 2 };
        case "interval":
            return { accuracy: 3, stability: 2, speed: 1, voiced: 2, confidence: 1, interval: 4, melody: 0, contour: 0, glide: 0, glideSpeed: 0 };
        case "melody_echo":
            return { accuracy: 2, stability: 1, speed: 1, voiced: 2, confidence: 1, interval: 0, melody: 4, contour: 3, glide: 0, glideSpeed: 0 };
        default:
            return { accuracy: 5, stability: 3, speed: 2, voiced: 2, confidence: 1, interval: 0, melody: 0, contour: 0, glide: 0, glideSpeed: 0 };
    }
}
function antiFrustrationAdjustments(failsInRow, drill) {
    // return adjusted window/hold if user is struggling
    if (failsInRow <= 1)
        return { tuneWindowCents: drill.tuneWindowCents, holdMs: drill.holdMs };
    const windowBump = Math.min(15, 5 * (failsInRow - 1));
    const holdDrop = Math.min(500, 150 * (failsInRow - 1));
    return {
        tuneWindowCents: Math.min(45, drill.tuneWindowCents + windowBump),
        holdMs: Math.max(600, drill.holdMs - holdDrop),
    };
}
function clamp01(x) {
    return Math.max(0, Math.min(1, x));
}
