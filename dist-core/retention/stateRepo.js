"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRetentionState = getRetentionState;
exports.upsertRetentionState = upsertRetentionState;
exports.markSharedWinForDay = markSharedWinForDay;
exports.setWeeklyGoalSessions = setWeeklyGoalSessions;
const db_1 = require("@/core/storage/db");
const DEFAULT_STATE = {
    dailyKey: undefined,
    daily: { sharedWin: false },
    weeklyKey: undefined,
    weekly: { goalSessions: 5 },
};
function safeParseMerge(v, fallback) {
    try {
        const obj = typeof v === 'string' ? JSON.parse(v) : v;
        if (!obj || typeof obj !== 'object')
            return fallback;
        return { ...fallback, ...obj, daily: { ...fallback.daily, ...(obj.daily ?? {}) }, weekly: { ...fallback.weekly, ...(obj.weekly ?? {}) } };
    }
    catch {
        return fallback;
    }
}
async function getRetentionState() {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM retention_state WHERE id = 'default' LIMIT 1;`);
    if (!rows[0])
        return DEFAULT_STATE;
    return safeParseMerge(rows[0].data, DEFAULT_STATE);
}
async function upsertRetentionState(s) {
    const d = await (0, db_1.getDb)();
    await (0, db_1.exec)(d, `INSERT INTO retention_state (id, data) VALUES ('default', ?) 
     ON CONFLICT(id) DO UPDATE SET data = excluded.data;`, [JSON.stringify(s)]);
}
async function markSharedWinForDay(dayKey) {
    const s = await getRetentionState();
    // reset daily flags if day changed
    if (s.dailyKey !== dayKey) {
        s.dailyKey = dayKey;
        s.daily = { sharedWin: false };
    }
    s.daily = { ...(s.daily ?? {}), sharedWin: true };
    await upsertRetentionState(s);
}
async function setWeeklyGoalSessions(goal) {
    const s = await getRetentionState();
    s.weekly = { ...(s.weekly ?? {}), goalSessions: Math.max(1, Math.min(14, Math.round(goal))) };
    await upsertRetentionState(s);
}
