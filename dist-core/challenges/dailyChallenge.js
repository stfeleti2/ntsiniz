"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyChallenge = getDailyChallenge;
exports.getDailyChallengeBest = getDailyChallengeBest;
exports.recordDailyChallengeAttempt = recordDailyChallengeAttempt;
const userStateRepo_1 = require("@/core/storage/userStateRepo");
const progress_1 = require("@/core/curriculum/progress");
// Keep it simple + offline: deterministic rotation.
const ROTATION = [
    { id: 'dc_pitch_lock', title: 'Pitch Lock Sprint', drillId: 'match_c4_lock', targetScore: 82 },
    { id: 'dc_stability_hold', title: 'Stability Hold', drillId: 'sustain_a3_steady', targetScore: 80 },
    { id: 'dc_interval_jump', title: 'Interval Jump', drillId: 'interval_m3_up', targetScore: 78 },
    { id: 'dc_phrase_echo', title: 'Phrase Echo', drillId: 'song_phrase_twinkle_a', targetScore: 76 },
    { id: 'dc_slide_clean', title: 'Clean Slide', drillId: 'slide_c4_to_g4', targetScore: 78 },
];
function getDailyChallenge(now = Date.now()) {
    const d = new Date(now);
    // day-of-year-ish: rotate deterministically
    const seed = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 1)) / 86400000);
    return ROTATION[seed % ROTATION.length];
}
async function getDailyChallengeBest(now = Date.now()) {
    const st = await (0, userStateRepo_1.getUserState)();
    const key = (0, progress_1.isoDate)(now);
    const best = st.dailyChallenge?.bestByDate?.[key];
    return typeof best === 'number' ? best : null;
}
async function recordDailyChallengeAttempt(score, now = Date.now()) {
    const st = await (0, userStateRepo_1.getUserState)();
    const key = (0, progress_1.isoDate)(now);
    const dc = st.dailyChallenge ?? { bestByDate: {} };
    const prev = dc.bestByDate[key];
    if (typeof prev !== 'number' || score > prev) {
        dc.bestByDate[key] = score;
        st.dailyChallenge = dc;
        await (0, userStateRepo_1.upsertUserState)(st);
    }
}
