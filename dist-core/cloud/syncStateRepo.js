"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSyncState = getSyncState;
exports.setSyncState = setSyncState;
const db_1 = require("@/core/storage/db");
const KEY = 'primary';
async function getSyncState() {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT data FROM sync_state WHERE id = ? LIMIT 1;`, [KEY]);
    if (!rows[0]) {
        const init = { lastPullAt: 0, lastSyncAt: 0 };
        await (0, db_1.exec)(d, `INSERT INTO sync_state (id, data) VALUES (?, ?);`, [KEY, JSON.stringify(init)]);
        return init;
    }
    try {
        const parsed = JSON.parse(rows[0].data);
        return {
            lastPullAt: Number(parsed.lastPullAt) || 0,
            lastSyncAt: Number(parsed.lastSyncAt) || 0,
        };
    }
    catch {
        return { lastPullAt: 0, lastSyncAt: 0 };
    }
}
async function setSyncState(next) {
    const d = await (0, db_1.getDb)();
    await (0, db_1.exec)(d, `INSERT INTO sync_state (id, data) VALUES (?, ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data;`, [KEY, JSON.stringify(next)]);
}
