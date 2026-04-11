"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreGuidedAttempt = scoreGuidedAttempt;
const drillScoring_1 = require("../scoring/drillScoring");
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const FULL_SCORING_FAMILIES = [
    'match_note',
    'sustain_hold',
    'pitch_slide',
    'interval_jump',
    'melody_echo',
    'confidence_rep',
    'phrase_sing',
    'dynamic_control',
    'vowel_shape',
    'vibrato_control',
    'register_bridge',
    'performance_run',
];
const coachTipByTag = {
    always_flat: 'You are usually landing low. Start a touch higher, then settle gently instead of lunging upward.',
    always_sharp: 'You often arrive high. Begin lower and let the center come to you before holding.',
    overshoot: 'You are arriving too aggressively. Slide in slower and stop earlier.',
    drift_down: 'Your pitch falls as you hold. Think steady airflow and a slightly brighter internal target.',
    unstable: 'The sound is wobbling. Make it smaller and more centered before adding intensity.',
    low_voiced_ratio: 'The system is not hearing enough clear voice. Use a speaking-level tone and finish the rep.',
    wrong_direction_interval: 'Focus on whether the pattern moves up or down before worrying about exact distance.',
    confidence_abort: 'Finish imperfect reps. Completion builds confidence faster than restarting.',
    fatigue_risk: 'Your system may be tired. Drop intensity, reset coordination, and come back lighter.',
};
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
function pushDiagnosisTags(metrics, family, abortFlag) {
    const tags = [];
    if (typeof metrics.meanCents === 'number' && metrics.meanCents <= -18)
        tags.push('always_flat');
    if (typeof metrics.meanCents === 'number' && metrics.meanCents >= 18)
        tags.push('always_sharp');
    if (typeof metrics.driftCentsPerSec === 'number' && metrics.driftCentsPerSec <= -7)
        tags.push('drift_down');
    if (typeof metrics.driftCentsPerSec === 'number' && metrics.driftCentsPerSec >= 7)
        tags.push('drift_up');
    if (typeof metrics.wobbleCents === 'number' && metrics.wobbleCents >= 24)
        tags.push('unstable');
    if (typeof metrics.voicedRatio === 'number' && metrics.voicedRatio < 0.5)
        tags.push('low_voiced_ratio');
    if (typeof metrics.voicedRatio === 'number' && metrics.voicedRatio < 0.36)
        tags.push('fatigue_risk');
    if (typeof metrics.overshootRate === 'number' && metrics.overshootRate >= 0.35)
        tags.push('overshoot');
    if (family === 'interval_jump' && metrics.intervalDirectionCorrect === false)
        tags.push('wrong_direction_interval');
    if (abortFlag)
        tags.push('confidence_abort');
    return tags;
}
function buildCoachTip(result) {
    for (const tag of result.diagnosisTags) {
        const tip = coachTipByTag[tag];
        if (tip)
            return tip;
    }
    if (result.family === 'confidence_rep')
        return 'You finished the rep. Keep that same calm commitment on the next one.';
    return 'That was a real rep. Keep the next one calm, centered, and connected.';
}
function buildRubricDimensions(args) {
    const confidence = clamp(args.metrics.confidenceAvg ?? 0.5);
    const voiced = clamp(args.metrics.voicedRatio ?? args.components.voiced ?? 0.5);
    const stability = clamp(1 - (args.metrics.wobbleCents ?? 20) / 40, 0, 1);
    const technique = args.components.accuracy ??
        args.components.note ??
        args.components.contour ??
        args.components.interval ??
        args.score01;
    const transferRelevant = !!args.assessmentEvidence?.transfer || ['melody_echo', 'phrase_sing', 'performance_run'].includes(args.family);
    const styleRelevant = (args.scoringLogic?.styleOrCommunicationWeight ?? 0) > 0 || ['phrase_sing', 'performance_run', 'melody_echo'].includes(args.family);
    const dimensions = {
        technique_accuracy: Math.round(clamp(technique, 0, 1) * 100),
        efficiency_health: Math.round(clamp(0.45 * voiced + 0.35 * stability + 0.2 * confidence, 0, 1) * 100),
        stability_repeatability: Math.round(clamp(0.55 * stability + 0.25 * voiced + 0.2 * confidence, 0, 1) * 100),
    };
    if (transferRelevant) {
        dimensions.transfer_application = Math.round(clamp(0.55 * args.score01 + 0.25 * voiced + 0.2 * confidence, 0, 1) * 100);
    }
    if (styleRelevant) {
        dimensions.stylism_communication = Math.round(clamp(0.5 * args.score01 + 0.25 * confidence + 0.25 * voiced, 0, 1) * 100);
    }
    return dimensions;
}
function scoreGuidedAttempt(args) {
    const family = normalizeFamily(args.metrics.drillType, args.packFamily);
    const report = (0, drillScoring_1.buildScoreReport)(args.metrics);
    const supported = FULL_SCORING_FAMILIES.includes(family);
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
            const note2 = clamp(1 - Math.abs(args.metrics.intervalErrorCents ?? 200) / 200, 0, 1);
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
        case 'phrase_sing': {
            const contour = clamp(args.metrics.contourHitRate ?? report.components.contour ?? report.components.accuracy, 0, 1);
            const melody = clamp(args.metrics.melodyHitRate ?? report.components.melody ?? report.components.accuracy, 0, 1);
            const entry = args.metrics.timeToEnterMs == null ? 0.6 : clamp(1 - args.metrics.timeToEnterMs / 3600, 0, 1);
            const completion = clamp(args.metrics.voicedRatio ?? 0, 0, 1);
            const confidence = report.components.confidence;
            components = { contour, melody, entry, completion, confidence };
            score01 = 0.28 * contour + 0.24 * melody + 0.18 * entry + 0.15 * completion + 0.15 * confidence;
            break;
        }
        case 'dynamic_control': {
            const stability = report.components.stability;
            const accuracy = report.components.accuracy;
            const drift = clamp(1 - Math.abs(args.metrics.driftCentsPerSec ?? 0) / 14, 0, 1);
            const voiced = report.components.voiced;
            const confidence = report.components.confidence;
            components = { stability, accuracy, drift, voiced, confidence };
            score01 = 0.34 * stability + 0.22 * accuracy + 0.16 * drift + 0.15 * voiced + 0.13 * confidence;
            break;
        }
        case 'vowel_shape': {
            const vowel_center = clamp(1 - (args.metrics.avgAbsCents ?? 60) / 45, 0, 1);
            const stability = report.components.stability;
            const voiced = report.components.voiced;
            const overshoot = clamp(1 - (args.metrics.overshootRate ?? 0) / 0.4, 0, 1);
            const confidence = report.components.confidence;
            components = { vowel_center, stability, voiced, overshoot, confidence };
            score01 = 0.3 * vowel_center + 0.25 * stability + 0.2 * voiced + 0.15 * overshoot + 0.1 * confidence;
            break;
        }
        case 'vibrato_control': {
            const wobbleCenter = 18;
            const wobbleTolerance = 18;
            const vibrato_window = clamp(1 - Math.abs((args.metrics.wobbleCents ?? wobbleCenter) - wobbleCenter) / wobbleTolerance, 0, 1);
            const stability = report.components.stability;
            const accuracy = report.components.accuracy;
            const voiced = report.components.voiced;
            const confidence = report.components.confidence;
            components = { vibrato_window, stability, accuracy, voiced, confidence };
            score01 = 0.32 * vibrato_window + 0.22 * stability + 0.18 * accuracy + 0.14 * voiced + 0.14 * confidence;
            break;
        }
        case 'register_bridge': {
            const direction = args.metrics.glideMonotonicity == null ? 0.7 : clamp(args.metrics.glideMonotonicity, 0, 1);
            const smoothness = args.metrics.glideSmoothness == null ? report.components.stability : clamp(args.metrics.glideSmoothness, 0, 1);
            const end_accuracy = clamp(1 - (args.metrics.avgAbsCents ?? 60) / 55, 0, 1);
            const entry = args.metrics.timeToEnterMs == null ? 0.6 : clamp(1 - args.metrics.timeToEnterMs / 3200, 0, 1);
            const confidence = report.components.confidence;
            components = { direction, smoothness, end_accuracy, entry, confidence };
            score01 = 0.28 * direction + 0.24 * smoothness + 0.2 * end_accuracy + 0.14 * entry + 0.14 * confidence;
            break;
        }
        case 'performance_run': {
            const completion = clamp(args.metrics.voicedRatio ?? 0, 0, 1);
            const contour = clamp(args.metrics.contourHitRate ?? report.components.contour ?? 0.6, 0, 1);
            const melody = clamp(args.metrics.melodyHitRate ?? report.components.melody ?? report.components.accuracy, 0, 1);
            const stability = report.components.stability;
            const confidence = report.components.confidence;
            components = { completion, contour, melody, stability, confidence };
            score01 = 0.25 * completion + 0.2 * contour + 0.2 * melody + 0.15 * stability + 0.2 * confidence;
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
    if (typeof args.metrics.voicedRatio === 'number' && args.metrics.voicedRatio < 0.4)
        finalScore = Math.min(finalScore, 54);
    const diagnosisTags = pushDiagnosisTags(args.metrics, family, args.abortFlag);
    const healthBlocked = false;
    const healthStatus = healthBlocked ? 'blocked' : 'clear';
    const rubricDimensions = buildRubricDimensions({
        score01: finalScore / 100,
        family,
        components,
        assessmentEvidence: args.assessmentEvidence,
        scoringLogic: args.scoringLogic,
        metrics: args.metrics,
    });
    const transferRelevant = !!args.assessmentEvidence?.transfer;
    const styleRelevant = !!args.assessmentEvidence?.styleOrCommunication || (args.scoringLogic?.styleOrCommunicationWeight ?? 0) > 0;
    const pressureRelevant = !!args.pressureLadderStep && args.pressureLadderStep !== 'none';
    const selfCoachingCaptured = !!args.selfRatingPrompt && !args.abortFlag;
    const gateStatus = {
        technical: finalScore >= threshold,
        transfer: transferRelevant ? finalScore >= Math.max(68, threshold - 4) : true,
        health: !healthBlocked,
        retention: true,
        pressure: pressureRelevant ? finalScore >= Math.max(65, threshold - 6) : true,
        independence: selfCoachingCaptured,
        style_or_communication: styleRelevant ? finalScore >= Math.max(68, threshold - 4) : true,
    };
    const blockedBy = [];
    if (!gateStatus.technical)
        blockedBy.push('technical gate');
    if (transferRelevant && !gateStatus.transfer)
        blockedBy.push('transfer gate');
    if (pressureRelevant && !gateStatus.pressure)
        blockedBy.push('pressure gate');
    if (styleRelevant && !gateStatus.style_or_communication)
        blockedBy.push('style gate');
    if (healthBlocked)
        blockedBy.push('health gate');
    const metrics = {
        mean_abs_cents: args.metrics.avgAbsCents ?? 0,
        stability_stddev_cents: args.metrics.wobbleCents ?? 0,
        voiced_ratio: args.metrics.voicedRatio ?? 0,
        mean_confidence: args.metrics.confidenceAvg ?? 0,
        entry_time_ms: args.metrics.timeToEnterMs ?? 0,
    };
    const partial = {
        family,
        supported,
        finalScore,
        passed: finalScore >= threshold && blockedBy.length === 0,
        band: bandFromScore(finalScore),
        components,
        metrics,
        diagnosisTags,
        rubricDimensions,
        gateStatus,
        assessmentEvidence: args.assessmentEvidence,
        blockedBy,
        healthStatus,
        loadTier: args.loadTier ?? null,
        pressureLadderStep: args.pressureLadderStep ?? null,
        styleEvidence: styleRelevant && finalScore >= Math.max(68, threshold - 4),
        pressureEvidence: pressureRelevant && finalScore >= Math.max(65, threshold - 6),
        selfCoachingCaptured,
        healthBlocked,
    };
    return {
        ...partial,
        coachTip: buildCoachTip(partial),
    };
}
