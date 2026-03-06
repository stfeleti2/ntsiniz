"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIdentity = getIdentity;
exports.setIdentity = setIdentity;
exports.ensureAuthedIdentity = ensureAuthedIdentity;
const db_1 = require("@/core/storage/db");
function rowToIdentity(r) {
    return {
        id: 'primary',
        provider: r.provider,
        remoteUserId: r.remoteUserId ?? null,
        email: r.email ?? null,
        updatedAt: r.updatedAt,
    };
}
async function getIdentity() {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM identities WHERE id = 'primary' LIMIT 1;`, []);
    if (rows[0])
        return rowToIdentity(rows[0]);
    const now = Date.now();
    await (0, db_1.exec)(d, `INSERT INTO identities (id, provider, remoteUserId, email, updatedAt) VALUES ('primary', 'supabase', NULL, NULL, ?);`, [now]);
    const rows2 = await (0, db_1.query)(d, `SELECT * FROM identities WHERE id = 'primary' LIMIT 1;`, []);
    return rowToIdentity(rows2[0]);
}
async function setIdentity(input) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    await (0, db_1.exec)(d, `INSERT INTO identities (id, provider, remoteUserId, email, updatedAt)
     VALUES ('primary', 'supabase', ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET remoteUserId = excluded.remoteUserId, email = excluded.email, updatedAt = excluded.updatedAt;`, [input.remoteUserId, input.email, now]);
    const rows = await (0, db_1.query)(d, `SELECT * FROM identities WHERE id = 'primary' LIMIT 1;`, []);
    return rowToIdentity(rows[0]);
}
async function ensureAuthedIdentity() {
    const identity = await getIdentity();
    const userId = identity.remoteUserId ?? 'local_user';
    const displayName = identity.email?.split('@')[0]?.trim() ||
        (identity.remoteUserId ? `user_${identity.remoteUserId.slice(0, 6)}` : 'Ntsiniz User');
    return { userId, displayName, email: identity.email };
}
