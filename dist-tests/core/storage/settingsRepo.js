"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SETTINGS = void 0;
exports.getSettings = getSettings;
exports.upsertSettings = upsertSettings;
const db_1 = require("./db");
exports.DEFAULT_SETTINGS = {
    language: "en",
    voiceCoaching: false,
    coachPlayback: true,
    listenThenSing: true,
    soundCues: true,
    sensitivity: 1,
    noiseGateRms: 0.02,
    hasCalibrated: false,
    qaSimulatedMic: false,
    qaMockShare: false,
    qaBypassMicPermission: false,
    remindersEnabled: false,
    reminderHour: 19,
    reminderMinute: 0,
    reminderNotificationId: null,
    seenMicPrimer: false,
    seenCameraPrimer: false,
    ghostAdvanced: false,
    devPerfOverlayEnabled: false,
    telemetryCrashReportingEnabled: true,
    qualityMode: 'AUTO',
    activeCurriculum: 'phase1',
    activeTrack: 'beginner',
    allowBluetoothMic: true,
    preferBuiltInMic: false,
    preferredInputUid: null,
    micCalibratedRms: 0,
    micCalibratedPeak: 0,
    micCalibratedClipped: false,
    preferredSampleRate: 0,
};
async function getSettings() {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM settings WHERE id = 'default' LIMIT 1;`);
    if (!rows[0])
        return exports.DEFAULT_SETTINGS;
    return safeParseMerge(rows[0].data, exports.DEFAULT_SETTINGS);
}
async function upsertSettings(s) {
    const d = await (0, db_1.getDb)();
    await (0, db_1.exec)(d, `INSERT INTO settings (id, data) VALUES ('default', ?) 
     ON CONFLICT(id) DO UPDATE SET data = excluded.data;`, [JSON.stringify(s)]);
}
function safeParseMerge(v, fallback) {
    try {
        const obj = typeof v === "string" ? JSON.parse(v) : v;
        if (!obj || typeof obj !== "object")
            return fallback;
        return { ...fallback, ...obj };
    }
    catch {
        return fallback;
    }
}
