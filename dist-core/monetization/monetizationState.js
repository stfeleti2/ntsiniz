"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonetizationState = getMonetizationState;
exports.updateMonetizationState = updateMonetizationState;
const settingsRepo_1 = require("@/core/storage/settingsRepo");
function todayKey() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}
function fresh() {
    return { dayKey: todayKey(), rewardedCount: 0, interstitialCount: 0 };
}
async function getMonetizationState() {
    const s = await (0, settingsRepo_1.getSettings)();
    const raw = s.monetization;
    if (!raw || raw.dayKey !== todayKey())
        return fresh();
    return { ...fresh(), ...raw };
}
async function updateMonetizationState(patch) {
    const s = await (0, settingsRepo_1.getSettings)();
    const cur = await getMonetizationState();
    const next = { ...cur, ...patch, dayKey: todayKey() };
    s.monetization = next;
    await (0, settingsRepo_1.upsertSettings)(s);
    return next;
}
