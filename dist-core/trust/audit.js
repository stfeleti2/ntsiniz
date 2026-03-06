"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audit = audit;
const db_1 = require("@/core/storage/db");
const id_1 = require("@/core/util/id");
const FORBIDDEN_KEYS = new Set(['email', 'token', 'authorization', 'password', 'passcode', 'phone', 'address']);
const ALLOWED_KEYS_BY_KIND = {
    'telemetry.consent': ['decision', 'source', 'version'],
    'share.create': ['shareKind', 'expiresAt', 'mode', 'scope'],
    'share.open': ['shareKind', 'mode', 'scope'],
    'share.expire': ['shareKind', 'reason'],
    'cloud.signin': ['provider', 'method'],
    'cloud.signout': ['provider'],
    'cloud.sync': ['direction', 'items', 'durationMs', 'ok'],
    'moderation.report': ['entityKind', 'reason', 'status'],
};
async function audit(e) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    const row = {
        id: (0, id_1.id)('audit'),
        createdAt: now,
        kind: e.kind,
        entityKind: e.entityKind ?? null,
        entityId: e.entityId ?? null,
        payload: JSON.stringify(scrubPayload(e.kind, e.payload ?? {})),
    };
    await (0, db_1.exec)(d, `INSERT INTO audit_events (id, createdAt, kind, entityKind, entityId, payload) VALUES (?, ?, ?, ?, ?, ?);`, [row.id, row.createdAt, row.kind, row.entityKind, row.entityId, row.payload]);
}
function scrubPayload(kind, p) {
    const allowed = new Set(ALLOWED_KEYS_BY_KIND[kind] ?? []);
    const out = {};
    for (const [k, v] of Object.entries(p ?? {})) {
        if (!allowed.has(k))
            continue;
        if (FORBIDDEN_KEYS.has(k.toLowerCase()))
            continue;
        if (v == null)
            continue;
        if (typeof v === 'number' || typeof v === 'boolean')
            out[k] = v;
        else if (typeof v === 'string')
            out[k] = v.slice(0, 80);
        else if (typeof v === 'object')
            out[k] = '[object]';
    }
    return out;
}
