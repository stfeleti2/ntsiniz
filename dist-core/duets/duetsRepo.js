"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDuets = listDuets;
exports.getDuetById = getDuetById;
exports.getDuetByInviteId = getDuetByInviteId;
exports.createDuetInvite = createDuetInvite;
exports.upsertImportedDuetInvite = upsertImportedDuetInvite;
exports.setDuetPartB = setDuetPartB;
exports.setDuetMix = setDuetMix;
exports.hideDuet = hideDuet;
const db_1 = require("@/core/storage/db");
const id_1 = require("@/core/util/id");
function rowToDuet(r) {
    return {
        id: r.id,
        createdAt: Number(r.createdAt) || 0,
        updatedAt: Number(r.updatedAt) || 0,
        inviteId: r.inviteId,
        role: r.role,
        inviterId: r.inviterId,
        inviterName: r.inviterName,
        title: r.title,
        sampleRate: Number(r.sampleRate) || 44100,
        durationMs: Number(r.durationMs) || 0,
        partAUri: r.partAUri,
        partBUri: r.partBUri ?? null,
        mixUri: r.mixUri ?? null,
        status: r.status,
        source: r.source === 'import' ? 'import' : 'self',
        expiresAt: r.expiresAt ?? null,
        hidden: !!r.hidden,
    };
}
async function listDuets(limit = 50) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM duets WHERE hidden = 0 ORDER BY createdAt DESC LIMIT ?;`, [limit]);
    const now = Date.now();
    return rows
        .map(rowToDuet)
        .filter((x) => !x.expiresAt || x.expiresAt > now);
}
async function getDuetById(id) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM duets WHERE id = ? LIMIT 1;`, [id]);
    if (!rows[0])
        return null;
    return rowToDuet(rows[0]);
}
async function getDuetByInviteId(inviteId) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM duets WHERE inviteId = ? AND hidden = 0 LIMIT 1;`, [inviteId]);
    if (!rows[0])
        return null;
    return rowToDuet(rows[0]);
}
async function createDuetInvite(input) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    const inviteId = input.inviteId || (0, id_1.id)('duet');
    const duet = {
        id: inviteId,
        createdAt: now,
        updatedAt: now,
        inviteId,
        role: 'inviter',
        inviterId: input.inviterId,
        inviterName: input.inviterName,
        title: input.title,
        sampleRate: input.sampleRate,
        durationMs: input.durationMs,
        partAUri: input.partAUri,
        partBUri: null,
        mixUri: null,
        status: 'invited',
        source: 'self',
        expiresAt: input.expiresAt ?? null,
        hidden: false,
    };
    await (0, db_1.exec)(d, `INSERT INTO duets (id, createdAt, updatedAt, inviteId, role, inviterId, inviterName, title, sampleRate, durationMs, partAUri, partBUri, mixUri, status, source, expiresAt, hidden)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, 'self', ?, 0)
     ON CONFLICT(id) DO UPDATE SET updatedAt = excluded.updatedAt, title = excluded.title, partAUri = excluded.partAUri;`, [
        duet.id,
        duet.createdAt,
        duet.updatedAt,
        duet.inviteId,
        duet.role,
        duet.inviterId,
        duet.inviterName,
        duet.title,
        duet.sampleRate,
        duet.durationMs,
        duet.partAUri,
        duet.status,
        duet.expiresAt ?? null,
    ]);
    return duet;
}
async function upsertImportedDuetInvite(input) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    const duet = {
        id: input.inviteId,
        createdAt: now,
        updatedAt: now,
        inviteId: input.inviteId,
        role: 'responder',
        inviterId: input.inviterId,
        inviterName: input.inviterName,
        title: input.title,
        sampleRate: input.sampleRate,
        durationMs: input.durationMs,
        partAUri: input.partAUri,
        partBUri: null,
        mixUri: null,
        status: 'invited',
        source: 'import',
        expiresAt: input.expiresAt ?? null,
        hidden: false,
    };
    await (0, db_1.exec)(d, `INSERT INTO duets (id, createdAt, updatedAt, inviteId, role, inviterId, inviterName, title, sampleRate, durationMs, partAUri, partBUri, mixUri, status, source, expiresAt, hidden)
     VALUES (?, ?, ?, ?, 'responder', ?, ?, ?, ?, ?, ?, NULL, NULL, 'invited', 'import', ?, 0)
     ON CONFLICT(id) DO UPDATE SET updatedAt = excluded.updatedAt, title = excluded.title, partAUri = excluded.partAUri, expiresAt = excluded.expiresAt;`, [
        duet.id,
        duet.createdAt,
        duet.updatedAt,
        duet.inviteId,
        duet.inviterId,
        duet.inviterName,
        duet.title,
        duet.sampleRate,
        duet.durationMs,
        duet.partAUri,
        duet.expiresAt ?? null,
    ]);
    return duet;
}
async function setDuetPartB(input) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    await (0, db_1.exec)(d, `UPDATE duets SET partBUri = ?, status = 'recorded', durationMs = COALESCE(?, durationMs), updatedAt = ? WHERE id = ?;`, [input.partBUri, input.durationMs ?? null, now, input.duetId]);
}
async function setDuetMix(input) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    await (0, db_1.exec)(d, `UPDATE duets SET mixUri = ?, status = 'mixed', durationMs = COALESCE(?, durationMs), updatedAt = ? WHERE id = ?;`, [input.mixUri, input.durationMs ?? null, now, input.duetId]);
}
async function hideDuet(duetId) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    await (0, db_1.exec)(d, `UPDATE duets SET hidden = 1, updatedAt = ? WHERE id = ?;`, [now, duetId]);
}
