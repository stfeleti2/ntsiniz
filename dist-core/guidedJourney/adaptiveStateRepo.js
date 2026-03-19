"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldEnableHelpMode = exports.chooseNextFamily = exports.inferDiagnosisTags = exports.DEFAULT_ADAPTIVE_STATE = exports.adaptiveReducer = void 0;
exports.getAdaptiveJourneyState = getAdaptiveJourneyState;
exports.upsertAdaptiveJourneyState = upsertAdaptiveJourneyState;
exports.recordAdaptiveAttempt = recordAdaptiveAttempt;
const db_1 = require("../storage/db");
const adaptiveCore_1 = require("./adaptiveCore");
Object.defineProperty(exports, "adaptiveReducer", { enumerable: true, get: function () { return adaptiveCore_1.adaptiveReducer; } });
Object.defineProperty(exports, "DEFAULT_ADAPTIVE_STATE", { enumerable: true, get: function () { return adaptiveCore_1.DEFAULT_ADAPTIVE_STATE; } });
Object.defineProperty(exports, "inferDiagnosisTags", { enumerable: true, get: function () { return adaptiveCore_1.inferDiagnosisTags; } });
Object.defineProperty(exports, "chooseNextFamily", { enumerable: true, get: function () { return adaptiveCore_1.chooseNextFamily; } });
Object.defineProperty(exports, "shouldEnableHelpMode", { enumerable: true, get: function () { return adaptiveCore_1.shouldEnableHelpMode; } });
async function getAdaptiveJourneyState() {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM settings WHERE id = 'guidedJourneyAdaptive' LIMIT 1;`);
    if (!rows[0])
        return adaptiveCore_1.DEFAULT_ADAPTIVE_STATE;
    return safeParseMerge(rows[0].data, adaptiveCore_1.DEFAULT_ADAPTIVE_STATE);
}
async function upsertAdaptiveJourneyState(next) {
    const d = await (0, db_1.getDb)();
    await (0, db_1.exec)(d, `INSERT INTO settings (id, data) VALUES ('guidedJourneyAdaptive', ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data;`, [JSON.stringify(next)]);
}
async function recordAdaptiveAttempt(payload, routeOverride) {
    const current = await getAdaptiveJourneyState();
    const seeded = routeOverride && current.routeId !== routeOverride ? { ...current, routeId: routeOverride } : current;
    const next = (0, adaptiveCore_1.adaptiveReducer)(seeded, { type: 'ATTEMPT_RECORDED', payload });
    await upsertAdaptiveJourneyState(next);
    return next;
}
function safeParseMerge(value, fallback) {
    try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        if (!parsed || typeof parsed !== 'object')
            return fallback;
        return { ...fallback, ...parsed };
    }
    catch {
        return fallback;
    }
}
