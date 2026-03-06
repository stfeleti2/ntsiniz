"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAuditEntry = addAuditEntry;
exports.listAudit = listAudit;
const db_1 = require("@/core/storage/db");
const id_1 = require("@/core/util/id");
function rowToAudit(r) {
    return {
        id: r.id,
        createdAt: r.createdAt,
        actorId: r.actorId,
        actorName: r.actorName,
        action: r.action,
        targetKind: r.targetKind,
        targetId: r.targetId,
        metaJson: r.metaJson ?? '{}',
    };
}
async function addAuditEntry(input) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    const a = {
        id: (0, id_1.id)('aud'),
        createdAt: now,
        actorId: input.actorId,
        actorName: input.actorName,
        action: input.action,
        targetKind: input.targetKind,
        targetId: input.targetId,
        metaJson: input.metaJson ?? JSON.stringify(input.meta ?? {}),
    };
    await (0, db_1.exec)(d, `INSERT INTO audit_log (id, createdAt, actorId, actorName, action, targetKind, targetId, metaJson)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, [a.id, a.createdAt, a.actorId, a.actorName, a.action, a.targetKind, a.targetId, a.metaJson]);
    return a;
}
async function listAudit(limit = 80) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM audit_log ORDER BY createdAt DESC LIMIT ?;`, [limit]);
    return rows.map(rowToAudit);
}
