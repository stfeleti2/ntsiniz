"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_USER_STATE = void 0;
exports.getUserState = getUserState;
exports.upsertUserState = upsertUserState;
const db_1 = require("./db");
exports.DEFAULT_USER_STATE = {
    curriculum: { dayIndex: 0, completedDayKeys: [] },
    streakShield: { usedDayKeys: [] },
    dailyChallenge: { bestByDate: {} },
    journeyV3: {
        routeId: null,
        stageId: null,
        lessonId: null,
        unlockedLessonIds: [],
        completedLessonIds: [],
        completedStageIds: [],
        assessmentByStageId: {},
        lessonGateByLessonId: {},
        activeRemediationBundleId: null,
        blockedPromotionReasons: [],
        compareBaseline: null,
        firstWinSnapshotId: null,
        firstWinCompletedAt: null,
    },
};
async function getUserState() {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM settings WHERE id = 'userState' LIMIT 1;`);
    if (!rows[0])
        return exports.DEFAULT_USER_STATE;
    return safeParseMerge(rows[0].data, exports.DEFAULT_USER_STATE);
}
async function upsertUserState(next) {
    const d = await (0, db_1.getDb)();
    await (0, db_1.exec)(d, `INSERT INTO settings (id, data) VALUES ('userState', ?) 
     ON CONFLICT(id) DO UPDATE SET data = excluded.data;`, [JSON.stringify(next)]);
}
function safeParseMerge(v, fallback) {
    try {
        const obj = typeof v === 'string' ? JSON.parse(v) : v;
        if (!obj || typeof obj !== 'object')
            return fallback;
        return { ...fallback, ...obj };
    }
    catch {
        return fallback;
    }
}
