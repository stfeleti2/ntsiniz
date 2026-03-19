"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreGuidedAttempt = scoreGuidedAttempt;
const drillScoring_1 = require("../scoring/drillScoring");
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
function bandFromScore(score) {
    if (score >= 90)
        return 'excellent';
    if (score >= 80)
        return 'pass_strong';
    if (score >= 70)
        return 'pass';
    if (score >= 60)
        return 'near_pass';
    if (score >= 45)
        return 'needs_help';
    return 'retry';
}
function normalizeFamily(drillType, packFamily) {
    if (packFamily)
        return packFamily;
    switch (drillType) {
        case 'sustain':
            return 'sustain_hold';
        case 'slide':
            return 'pitch_slide';
        case 'interval':
            return 'interval_jump';
        case 'melody_echo':
            return 'melody_echo';
        default:
            return 'match_note';
    }
}
function pushDiagnosisTags(metrics, family) {
    const tags = [];
    if (typeof metrics.meanCents === 'number' && metrics.meanCents <= -18)
        tags.push('slight_flat_bias');
    if (typeof metrics.meanCents === 'number' && metrics.meanCents >= 18)
        tags.push('slight_sharp_bias');
    if (typeof metrics.wobbleCents === 'number' && metrics.wobbleCents <= 12)
        tags.push('good_stability');
    if (typeof metrics.wobbleCents === 'number' && metrics.wobbleCents >= 24)
        tags.push('unstable');
    if (typeof metrics.voicedRatio === 'number' && metrics.voicedRatio < 0.5)
        tags.push('low_voiced_ratio');
    if (family === 'interval_jump' && metrics.intervalDirectionCorrect === false)
        tags.push('wrong_direction_interval');
    return tags;
}
function buildCoachTip(result) {
    if (result.diagnosisTags.includes('slight_flat_bias'))
        return 'You stayed steady. Next, aim a tiny bit higher on entry.';
    if (result.diagnosisTags.includes('slight_sharp_bias'))
        return 'Nice energy. Let the note settle a touch lower before you hold.';
    if (result.diagnosisTags.includes('unstable'))
        return 'Keep the airflow quieter and steadier so the pitch can settle.';
    if (result.diagnosisTags.includes('low_voiced_ratio'))
        return 'Give the note a clearer, more continuous vowel so the pitch locks sooner.';
    if (result.family === 'confidence_rep')
        return 'You finished the rep. Keep that same calm commitment on the next one.';
    return 'That was a real rep. Keep the next one calm, centered, and connected.';
}
function scoreGuidedAttempt(args) {
    const family = normalizeFamily(args.metrics.drillType, args.packFamily);
    const report = (0, drillScoring_1.buildScoreReport)(args.metrics);
    const supported = ['match_note', 'sustain_hold', 'pitch_slide', 'interval_jump', 'melody_echo', 'confidence_rep'].includes(family);
    const threshold = args.masteryThreshold ?? 72;
    let components = {};
    let score01 = report.score / 100;
    switch (family) {
        case 'match_note': {
            const accuracy = report.components.accuracy;
            const zone = clamp(1 - (args.metrics.avgAbsCents ?? 60) / 30, 0, 1);
            const entry = args.metrics.timeToEnterMs == null ? 0.4 : clamp(1 - args.metrics.timeToEnterMs / 2500, 0, 1);
            const overshoot = clamp(1 - (args.metrics.overshootRate ?? 0) / 0.45, 0, 1);
            const voiced = report.components.voiced;
            components = { accuracy, zone, entry, overshoot, voiced };
            score01 = 0.4 * accuracy + 0.25 * zone + 0.15 * entry + 0.1 * overshoot + 0.1 * voiced;
            break;
        }
        case 'sustain_hold': {
            const accuracy = report.components.accuracy;
            const stability = report.components.stability;
            const targetHoldMs = args.metrics.holdMs || 2200;
            const heldDurationMs = Math.round((args.metrics.voicedRatio ?? 0) * targetHoldMs);
            const hold = clamp(heldDurationMs / targetHoldMs, 0, 1);
            const zone = clamp(1 - (args.metrics.avgAbsCents ?? 60) / 35, 0, 1);
            const voiced = report.components.voiced;
            components = { accuracy, stability, hold, zone, voiced };
            score01 = 0.25 * accuracy + 0.3 * stability + 0.25 * hold + 0.1 * zone + 0.1 * voiced;
            break;
        }
        case 'pitch_slide': {
            const entry = args.metrics.timeToEnterMs == null ? 0.4 : clamp(1 - args.metrics.timeToEnterMs / 2500, 0, 1);
            const hold = clamp((args.metrics.voicedRatio ?? 0) / 0.75, 0, 1);
            const direction = args.metrics.glideMonotonicity == null ? 0.7 : clamp(args.metrics.glideMonotonicity, 0, 1);
            const smoothness = args.metrics.glideSmoothness == null ? report.components.stability : clamp(args.metrics.glideSmoothness, 0, 1);
            const endAccuracy = clamp(1 - (args.metrics.avgAbsCents ?? 60) / 60, 0, 1);
            components = { entry, hold, direction, smoothness, end_accuracy: endAccuracy };
            score01 = 0.3 * entry + 0.25 * hold + 0.2 * direction + 0.15 * smoothness + 0.1 * endAccuracy;
            break;
        }
        case 'interval_jump': {
            const note1 = report.components.accuracy;
            const note2 = clamp(1 - (Math.abs(args.metrics.intervalErrorCents ?? 200) / 200), 0, 1);
            const intervalSize = clamp(1 - Math.abs(args.metrics.intervalErrorCents ?? 200) / 200, 0, 1);
            const direction = args.metrics.intervalDirectionCorrect ? 1 : 0;
            const stability = report.components.stability;
            components = { note1, note2, interval_size: intervalSize, direction, stability };
            score01 = 0.2 * note1 + 0.25 * note2 + 0.25 * intervalSize + 0.15 * direction + 0.15 * stability;
            break;
        }
        case 'melody_echo': {
            const contour = clamp(args.metrics.contourHitRate ?? 0, 0, 1);
            const interval = clamp(args.metrics.melodyHitRate ?? 0, 0, 1);
            const note = report.components.accuracy;
            const rhythm = args.metrics.timeToEnterMs == null ? 0.55 : clamp(1 - args.metrics.timeToEnterMs / 3500, 0, 1);
            const completion = clamp(args.metrics.voicedRatio ?? 0, 0, 1);
            components = { contour, interval, note, rhythm, completion };
            score01 = 0.3 * contour + 0.25 * interval + 0.2 * note + 0.15 * rhythm + 0.1 * completion;
            break;
        }
        case 'confidence_rep': {
            const completion = clamp(args.metrics.voicedRatio ?? 0, 0, 1);
            const nonAbort = args.abortFlag ? 0 : 1;
            const voiced = report.components.voiced;
            const accuracy = report.components.accuracy;
            const confidence = report.components.confidence;
            components = { completion, non_abort: nonAbort, voiced, accuracy, confidence };
            score01 = 0.35 * completion + 0.25 * nonAbort + 0.15 * voiced + 0.1 * accuracy + 0.15 * confidence;
            break;
        }
        default:
            components = {
                accuracy: report.components.accuracy,
                stability: report.components.stability,
                voiced: report.components.voiced,
            };
            score01 = report.score / 100;
            break;
    }
    let finalScore = Math.round(score01 * 100);
    if (typeof args.metrics.confidenceAvg === 'number' && args.metrics.confidenceAvg < 0.35)
        finalScore = Math.min(finalScore, 45);
    else if (typeof args.metrics.confidenceAvg === 'number' && args.metrics.confidenceAvg < 0.45)
        finalScore = Math.min(finalScore, 59);
    const metrics = {
        mean_abs_cents: args.metrics.avgAbsCents ?? 0,
        stability_stddev_cents: args.metrics.wobbleCents ?? 0,
        voiced_ratio: args.metrics.voicedRatio ?? 0,
        mean_confidence: args.metrics.confidenceAvg ?? 0,
        entry_time_ms: args.metrics.timeToEnterMs ?? 0,
    };
    const result = {
        family,
        supported,
        finalScore,
        passed: finalScore >= threshold,
        band: bandFromScore(finalScore),
        components,
        metrics,
        diagnosisTags: pushDiagnosisTags(args.metrics, family),
        coachTip: '',
    };
    result.coachTip = buildCoachTip(result);
    return result;
}
