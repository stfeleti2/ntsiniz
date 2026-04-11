"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptiveReducer = exports.shouldEnableHelpMode = exports.chooseNextFamily = exports.inferDiagnosisTags = void 0;
const average = (values) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
const inferDiagnosisTags = (attempts) => {
    const tags = new Set();
    const recent = attempts.slice(-8);
    const biases = recent.map((a) => a.biasCents ?? 0);
    const drifts = recent.map((a) => a.driftSlopeCentsPerSec ?? 0);
    const overshoots = recent.map((a) => a.overshootRate ?? 0);
    const stabilities = recent.map((a) => a.stabilityStdDevCents ?? 0);
    const voiced = recent.map((a) => a.voicedRatio ?? 1);
    const directions = recent
        .filter((a) => a.family === "interval_jump")
        .map((a) => a.correctDirectionRatio ?? 1);
    const aborts = recent.map((a) => (a.abortFlag ? 1 : 0));
    if (average(biases) <= -18)
        tags.add("always_flat");
    if (average(biases) >= 18)
        tags.add("always_sharp");
    if (average(drifts) <= -8)
        tags.add("drift_down");
    if (average(drifts) >= 8)
        tags.add("drift_up");
    if (average(overshoots) >= 0.35)
        tags.add("overshoot");
    if (average(stabilities) >= 24)
        tags.add("unstable");
    if (average(voiced) < 0.5)
        tags.add("low_voiced_ratio");
    if (directions.length && average(directions) < 0.6)
        tags.add("wrong_direction_interval");
    if (average(aborts) >= 0.25)
        tags.add("confidence_abort");
    return [...tags];
};
exports.inferDiagnosisTags = inferDiagnosisTags;
const diagnosisToFamilies = {
    always_flat: ["pitch_slide", "match_note", "sustain_hold"],
    always_sharp: ["pitch_slide", "match_note", "interval_jump"],
    overshoot: ["pitch_slide", "match_note"],
    drift_down: ["sustain_hold", "dynamic_control", "phrase_sing"],
    drift_up: ["pitch_slide", "sustain_hold"],
    unstable: ["sustain_hold", "confidence_rep", "vowel_shape"],
    low_voiced_ratio: ["confidence_rep", "match_note", "phrase_sing"],
    wrong_direction_interval: ["interval_jump", "melody_echo"],
    confidence_abort: ["confidence_rep", "performance_run"]
};
const chooseNextFamily = (routeBias, tags, recentAttempts) => {
    for (const tag of tags) {
        const recommended = diagnosisToFamilies[tag];
        if (recommended?.length)
            return recommended[0];
    }
    const lastFamily = recentAttempts.at(-1)?.family;
    const preferred = routeBias.find((family) => family !== lastFamily);
    return preferred ?? "match_note";
};
exports.chooseNextFamily = chooseNextFamily;
const shouldEnableHelpMode = (recentAttempts) => {
    const sameDrillRecent = recentAttempts.slice(-3);
    if (sameDrillRecent.length === 3 && sameDrillRecent.every((a) => a.score < 55))
        return true;
    const rollingFive = recentAttempts.slice(-5);
    if (rollingFive.length === 5 && average(rollingFive.map((a) => a.score)) < 55)
        return true;
    const lowVoicedTwo = recentAttempts.slice(-2);
    if (lowVoicedTwo.length === 2 && lowVoicedTwo.every((a) => (a.voicedRatio ?? 1) < 0.5))
        return true;
    return false;
};
exports.shouldEnableHelpMode = shouldEnableHelpMode;
const adaptiveReducer = (state, action) => {
    switch (action.type) {
        case "ATTEMPT_RECORDED": {
            const recentAttempts = [...state.recentAttempts, action.payload].slice(-20);
            const tags = (0, exports.inferDiagnosisTags)(recentAttempts);
            const helpMode = (0, exports.shouldEnableHelpMode)(recentAttempts);
            const routeBiasMap = {
                R1: ["match_note", "sustain_hold", "confidence_rep"],
                R2: ["pitch_slide", "interval_jump", "sustain_hold"],
                R3: ["confidence_rep", "phrase_sing", "performance_run"],
                R4: ["match_note", "interval_jump", "melody_echo", "phrase_sing"],
                R5: ["melody_echo", "dynamic_control", "register_bridge", "performance_run"]
            };
            const nextFamily = (0, exports.chooseNextFamily)(routeBiasMap[state.routeId] ?? routeBiasMap.R4, tags, recentAttempts);
            return {
                ...state,
                recentAttempts,
                helpMode,
                voiceProfile: {
                    tags,
                    rollingBiasCents: average(recentAttempts.map((a) => a.biasCents ?? 0)),
                    rollingDriftSlope: average(recentAttempts.map((a) => a.driftSlopeCentsPerSec ?? 0)),
                    rollingOvershootRate: average(recentAttempts.map((a) => a.overshootRate ?? 0)),
                    rollingStabilityStdDev: average(recentAttempts.map((a) => a.stabilityStdDevCents ?? 0)),
                    rollingVoicedRatio: average(recentAttempts.map((a) => a.voicedRatio ?? 1))
                },
                lastRecommendedDrillId: `${nextFamily}::recommended`
            };
        }
        case "RESET_HELP_MODE":
            return { ...state, helpMode: false };
        case "ROUTE_OVERRIDE":
            return { ...state, routeId: action.payload.routeId };
        default:
            return state;
    }
};
exports.adaptiveReducer = adaptiveReducer;
