"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStreakShieldStatus = getStreakShieldStatus;
exports.applyShieldForDay = applyShieldForDay;
exports.getShieldedDayKeys = getShieldedDayKeys;
const userStateRepo_1 = require("@/core/storage/userStateRepo");
function startOfDay(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}
async function getStreakShieldStatus(now = Date.now()) {
    const st = await (0, userStateRepo_1.getUserState)();
    const used = st.streakShield?.usedDayKeys ?? [];
    const lastUsedAt = st.streakShield?.lastUsedAt ?? 0;
    const yesterdayKey = startOfDay(now - 86400000);
    const alreadyShielded = used.includes(yesterdayKey);
    const daysSinceUsed = lastUsedAt ? (startOfDay(now) - startOfDay(lastUsedAt)) / 86400000 : 999;
    const available = daysSinceUsed >= 7;
    return {
        available,
        canApplyForYesterday: available && !alreadyShielded,
        yesterdayKey,
    };
}
async function applyShieldForDay(dayKey, now = Date.now()) {
    const st = await (0, userStateRepo_1.getUserState)();
    const shield = st.streakShield ?? { usedDayKeys: [] };
    if (!shield.usedDayKeys.includes(dayKey))
        shield.usedDayKeys = [...shield.usedDayKeys, dayKey];
    shield.lastUsedAt = now;
    st.streakShield = shield;
    await (0, userStateRepo_1.upsertUserState)(st);
}
async function getShieldedDayKeys() {
    const st = await (0, userStateRepo_1.getUserState)();
    return st.streakShield?.usedDayKeys ?? [];
}
