"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertTakeFile = upsertTakeFile;
exports.markTakeSaved = markTakeSaved;
exports.markTakeIndexed = markTakeIndexed;
exports.listUnindexedTakes = listUnindexedTakes;
exports.listOrphanSavedTakes = listOrphanSavedTakes;
exports.reconcileTakeFilePaths = reconcileTakeFilePaths;
const db_1 = require("./db");
const id_1 = require("@/core/util/id");
async function upsertTakeFile(input) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    // Treat empty string ids as "missing". (Passing id: '' previously caused PK collisions.)
    const safeId = input.id && String(input.id).length > 0 ? input.id : undefined;
    const row = {
        id: safeId ?? (0, id_1.id)('take'),
        createdAt: now,
        updatedAt: now,
        path: input.path,
        tmpPath: input.tmpPath ?? null,
        status: input.status,
        attemptId: input.attemptId ?? null,
        sessionId: input.sessionId ?? null,
        drillId: input.drillId ?? null,
        meta: input.meta ?? {},
    };
    await (0, db_1.exec)(d, `INSERT INTO take_files (id, createdAt, updatedAt, path, tmpPath, status, attemptId, sessionId, drillId, metaJson)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(path) DO UPDATE SET
       updatedAt=excluded.updatedAt,
       tmpPath=excluded.tmpPath,
       status=excluded.status,
       attemptId=excluded.attemptId,
       sessionId=excluded.sessionId,
       drillId=excluded.drillId,
       metaJson=excluded.metaJson;`, [
        row.id,
        row.createdAt,
        row.updatedAt,
        row.path,
        row.tmpPath,
        row.status,
        row.attemptId,
        row.sessionId,
        row.drillId,
        JSON.stringify(row.meta ?? {}),
    ]);
    return row;
}
async function markTakeSaved(path, tmpPath) {
    return await upsertTakeFile({ id: (0, id_1.id)('take'), path, tmpPath: tmpPath ?? null, status: 'saved' });
}
async function markTakeIndexed(path, ctx) {
    return await upsertTakeFile({
        id: (0, id_1.id)('take'),
        path,
        tmpPath: null,
        status: 'indexed',
        attemptId: ctx.attemptId,
        sessionId: ctx.sessionId,
        drillId: ctx.drillId,
        meta: ctx.meta ?? {},
    });
}
async function listUnindexedTakes(limit = 50) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM take_files WHERE status IN ('saved','saving') ORDER BY updatedAt DESC LIMIT ?;`, [limit]);
    return rows.map(mapRow);
}
async function listOrphanSavedTakes(limit = 50) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM take_files WHERE status = 'saved' AND (attemptId IS NULL OR attemptId = '') ORDER BY updatedAt DESC LIMIT ?;`, [limit]);
    return rows.map(mapRow);
}
async function reconcileTakeFilePaths(updates) {
    if (!updates.length)
        return;
    const d = await (0, db_1.getDb)();
    await (0, db_1.withTransaction)(d, async () => {
        for (const u of updates) {
            await (0, db_1.exec)(d, `UPDATE take_files SET path = ?, tmpPath = NULL, updatedAt = ? WHERE path = ?;`, [u.to, Date.now(), u.from]).catch(() => { });
        }
    });
}
function mapRow(r) {
    return {
        ...r,
        meta: safeParse(r.metaJson),
    };
}
function safeParse(v) {
    try {
        return typeof v === 'string' ? JSON.parse(v) : v;
    }
    catch {
        return {};
    }
}
