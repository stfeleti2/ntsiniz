"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PROFILE = void 0;
exports.getProfile = getProfile;
exports.upsertProfile = upsertProfile;
const db_1 = require("./db");
exports.DEFAULT_PROFILE = {
    updatedAt: 0,
    biasCents: 0,
    driftCentsPerSec: 0,
    wobbleCents: 0,
    overshootRate: 0,
    voicedRatio: 0,
    confidence: 0,
};
async function getProfile() {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM profile WHERE id = 'default' LIMIT 1;`);
    if (!rows[0])
        return exports.DEFAULT_PROFILE;
    return safeParse(rows[0].data, exports.DEFAULT_PROFILE);
}
async function upsertProfile(p) {
    const d = await (0, db_1.getDb)();
    await (0, db_1.exec)(d, `INSERT INTO profile (id, updatedAt, data) VALUES ('default', ?, ?) 
     ON CONFLICT(id) DO UPDATE SET updatedAt = excluded.updatedAt, data = excluded.data;`, [p.updatedAt, JSON.stringify(p)]);
}
function safeParse(v, fallback) {
    try {
        return typeof v === "string" ? JSON.parse(v) : v;
    }
    catch {
        return fallback;
    }
}
