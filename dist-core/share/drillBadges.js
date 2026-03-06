"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDrillBadges = buildDrillBadges;
const i18n_1 = require("../i18n");
function buildDrillBadges(input) {
    const { attempt, bestScoreBefore } = input;
    const m = attempt.metrics ?? {};
    const b = [];
    // Personal best
    if (typeof bestScoreBefore === "number" && attempt.score > bestScoreBefore) {
        b.push({ emoji: "🏆", text: (0, i18n_1.t)('badges.personalBest') });
    }
    // Core skill badges
    if (typeof m.avgAbsCents === "number") {
        if (m.avgAbsCents <= 10)
            b.push({ emoji: "🎯", text: (0, i18n_1.t)('badges.accuracyElite') });
        else if (m.avgAbsCents <= 18)
            b.push({ emoji: "🎯", text: (0, i18n_1.t)('badges.accuracyUp') });
    }
    if (typeof m.wobbleCents === "number") {
        if (m.wobbleCents <= 10)
            b.push({ emoji: "🧘", text: (0, i18n_1.t)('badges.rockSolid') });
        else if (m.wobbleCents <= 16)
            b.push({ emoji: "🧘", text: (0, i18n_1.t)('badges.stableTone') });
    }
    if (typeof m.timeToEnterMs === "number") {
        if (m.timeToEnterMs <= 900)
            b.push({ emoji: "⚡", text: (0, i18n_1.t)('badges.quickLock') });
        else if (m.timeToEnterMs <= 1500)
            b.push({ emoji: "⚡", text: (0, i18n_1.t)('badges.fastEntry') });
    }
    if (typeof m.voicedRatio === "number" && m.voicedRatio >= 0.85) {
        b.push({ emoji: "🎤", text: (0, i18n_1.t)('badges.strongVoice') });
    }
    // Advanced drill-type badges
    if (attempt.metrics?.drillType === "interval" && typeof m.intervalErrorCents === "number") {
        const okDir = m.intervalDirectionCorrect !== false;
        if (Math.abs(m.intervalErrorCents) <= 18 && okDir)
            b.push({ emoji: "🎶", text: (0, i18n_1.t)('badges.intervalNailed') });
    }
    if (attempt.metrics?.drillType === "melody_echo") {
        if (typeof m.contourHitRate === "number" && m.contourHitRate >= 0.9)
            b.push({ emoji: "🪄", text: (0, i18n_1.t)('badges.contourPerfect') });
        if (typeof m.melodyHitRate === "number" && m.melodyHitRate >= 0.8)
            b.push({ emoji: "🎼", text: (0, i18n_1.t)('badges.melodyClean') });
    }
    if (attempt.metrics?.drillType === "slide") {
        if (typeof m.glideSmoothness === "number" && m.glideSmoothness >= 0.75)
            b.push({ emoji: "🧊", text: (0, i18n_1.t)('badges.smoothGlide') });
        if (typeof m.glideMonotonicity === "number" && m.glideMonotonicity >= 0.85)
            b.push({ emoji: "📈", text: (0, i18n_1.t)('badges.cleanSlide') });
    }
    // Keep it punchy and shareable
    return b.slice(0, 6);
}
