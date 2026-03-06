"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChallengeState = getChallengeState;
exports.getTodayChallengeDay = getTodayChallengeDay;
exports.completeChallengeDay = completeChallengeDay;
exports.resetChallenge = resetChallenge;
const progress_1 = require("@/core/curriculum/progress");
const settingsRepo_1 = require("@/core/storage/settingsRepo");
const TOTAL_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
function clampDay(day) {
    if (!Number.isFinite(day))
        return 1;
    return Math.max(1, Math.min(TOTAL_DAYS, Math.floor(day)));
}
function makeInitialState(now = Date.now()) {
    return {
        startedAt: (0, progress_1.startOfDay)(now),
        days: Array.from({ length: TOTAL_DAYS }, (_, i) => ({
            day: i + 1,
            completedAt: null,
            bestScore: null,
            completedDate: null,
        })),
    };
}
function normalizeState(raw, now = Date.now()) {
    if (!raw || typeof raw !== 'object')
        return makeInitialState(now);
    const candidate = raw;
    const startedAt = typeof candidate.startedAt === 'number' ? (0, progress_1.startOfDay)(candidate.startedAt) : (0, progress_1.startOfDay)(now);
    const days = Array.from({ length: TOTAL_DAYS }, (_, i) => {
        const row = (candidate.days ?? [])[i];
        const score = typeof row?.bestScore === 'number' ? Math.round(row.bestScore) : null;
        return {
            day: i + 1,
            completedAt: typeof row?.completedAt === 'number' ? row.completedAt : null,
            bestScore: score,
            completedDate: typeof row?.completedDate === 'string' ? row.completedDate : null,
        };
    });
    return { startedAt, days };
}
async function saveState(state) {
    const s = await (0, settingsRepo_1.getSettings)();
    await (0, settingsRepo_1.upsertSettings)({ ...s, pitchLockChallenge: state });
    return state;
}
async function getChallengeState(now = Date.now()) {
    const s = await (0, settingsRepo_1.getSettings)();
    const next = normalizeState(s.pitchLockChallenge, now);
    if (!s.pitchLockChallenge)
        await (0, settingsRepo_1.upsertSettings)({ ...s, pitchLockChallenge: next });
    return next;
}
function getTodayChallengeDay(state, now = Date.now()) {
    const elapsedDays = Math.floor(((0, progress_1.startOfDay)(now) - (0, progress_1.startOfDay)(state.startedAt)) / DAY_MS);
    return clampDay(elapsedDays + 1);
}
async function completeChallengeDay(day, score, now = Date.now()) {
    const current = await getChallengeState(now);
    const idx = clampDay(day) - 1;
    const prev = current.days[idx];
    const nextScore = typeof prev.bestScore === 'number' ? Math.max(prev.bestScore, Math.round(score)) : Math.round(score);
    const updated = {
        ...current,
        days: current.days.map((d, i) => i !== idx
            ? d
            : {
                ...d,
                completedAt: prev.completedAt ?? now,
                bestScore: nextScore,
                completedDate: prev.completedDate ?? (0, progress_1.isoDate)(now),
            }),
    };
    return saveState(updated);
}
async function resetChallenge(now = Date.now()) {
    return saveState(makeInitialState(now));
}
