"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_VOICE_IDENTITY = void 0;
exports.getVoiceIdentity = getVoiceIdentity;
exports.upsertVoiceIdentity = upsertVoiceIdentity;
const db_1 = require("@/core/storage/db");
exports.DEFAULT_VOICE_IDENTITY = {
    updatedAt: 0,
    coachingMode: 'starter',
    onboardingIntent: 'justExplore',
    firstWinComplete: false,
    firstWinVersion: 0,
    firstWinSnapshot: null,
    strengths: [],
    currentFocus: [],
    comfortZone: { lowMidi: null, highMidi: null },
    likelyFamily: { label: null, confidence: 0 },
    recommendedLoadTier: null,
    activeRemediationBundleId: null,
    activeRemediationBundleName: null,
    currentAssessmentFocus: [],
};
async function getVoiceIdentity() {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM settings WHERE id = 'voiceIdentity' LIMIT 1;`);
    if (!rows[0])
        return exports.DEFAULT_VOICE_IDENTITY;
    return safeParseMerge(rows[0].data, exports.DEFAULT_VOICE_IDENTITY);
}
async function upsertVoiceIdentity(next) {
    const d = await (0, db_1.getDb)();
    await (0, db_1.exec)(d, `INSERT INTO settings (id, data) VALUES ('voiceIdentity', ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data;`, [JSON.stringify(next)]);
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
