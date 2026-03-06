"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReport = createReport;
exports.listReports = listReports;
exports.getReportById = getReportById;
exports.resolveReport = resolveReport;
const db_1 = require("@/core/storage/db");
const id_1 = require("@/core/util/id");
function rowToReport(r) {
    return {
        id: r.id,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        reporterId: r.reporterId,
        reporterName: r.reporterName,
        entityKind: r.entityKind,
        entityId: r.entityId,
        reason: r.reason,
        notes: r.notes ?? null,
        status: r.status,
    };
}
async function createReport(input) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    const r = {
        id: (0, id_1.id)('rpt'),
        createdAt: now,
        updatedAt: now,
        reporterId: input.reporterId,
        reporterName: input.reporterName,
        entityKind: input.entityKind,
        entityId: input.entityId,
        reason: input.reason,
        notes: input.notes ?? null,
        status: 'open',
    };
    await (0, db_1.exec)(d, `INSERT INTO reports (id, createdAt, updatedAt, reporterId, reporterName, entityKind, entityId, reason, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open');`, [r.id, r.createdAt, r.updatedAt, r.reporterId, r.reporterName, r.entityKind, r.entityId, r.reason, r.notes ?? null]);
    return r;
}
async function listReports(limit = 50) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM reports ORDER BY updatedAt DESC LIMIT ?;`, [limit]);
    return rows.map(rowToReport);
}
async function getReportById(id) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM reports WHERE id = ? LIMIT 1;`, [id]);
    return rows[0] ? rowToReport(rows[0]) : null;
}
async function resolveReport(id) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    await (0, db_1.exec)(d, `UPDATE reports SET status = 'resolved', updatedAt = ? WHERE id = ?;`, [now, id]);
}
