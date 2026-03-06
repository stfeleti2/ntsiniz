"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClip = createClip;
exports.getClipById = getClipById;
exports.listClips = listClips;
exports.listClipsInRange = listClipsInRange;
exports.hideClip = hideClip;
const db_1 = require("@/core/storage/db");
const id_1 = require("@/core/util/id");
const enqueue_1 = require("@/core/cloud/enqueue");
function safeParse(v) {
    try {
        return typeof v === 'string' ? JSON.parse(v) : v;
    }
    catch {
        return {};
    }
}
function rowToClip(r) {
    return {
        id: r.id,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        userId: r.userId,
        displayName: r.displayName,
        templateId: r.templateId,
        title: r.title,
        durationMs: r.durationMs,
        videoUri: r.videoUri,
        thumbnailUri: r.thumbnailUri ?? null,
        score: r.score,
        metrics: safeParse(r.metrics),
        hidden: !!r.hidden,
    };
}
async function createClip(input) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    const clip = {
        id: (0, id_1.id)('clip'),
        createdAt: now,
        updatedAt: now,
        userId: input.userId,
        displayName: input.displayName,
        templateId: input.templateId,
        title: input.title,
        durationMs: input.durationMs,
        videoUri: input.videoUri,
        thumbnailUri: input.thumbnailUri ?? null,
        score: input.score,
        metrics: input.metrics ?? {},
        hidden: false,
    };
    await (0, db_1.exec)(d, `INSERT INTO clips (id, createdAt, updatedAt, userId, displayName, templateId, title, durationMs, videoUri, thumbnailUri, score, metrics, hidden)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`, [
        clip.id,
        clip.createdAt,
        clip.updatedAt,
        clip.userId,
        clip.displayName,
        clip.templateId,
        clip.title,
        clip.durationMs,
        clip.videoUri,
        clip.thumbnailUri,
        clip.score,
        JSON.stringify(clip.metrics ?? {}),
    ]);
    await (0, enqueue_1.enqueueUpsert)('clips', clip.id, {
        id: clip.id,
        createdAt: clip.createdAt,
        updatedAt: clip.updatedAt,
        userId: clip.userId,
        displayName: clip.displayName,
        templateId: clip.templateId,
        title: clip.title,
        durationMs: clip.durationMs,
        // videoUri is device-local; remote can store a public URL later
        videoUri: '',
        thumbnailUri: clip.thumbnailUri ?? null,
        score: clip.score,
        metrics: clip.metrics ?? {},
        hidden: false,
    }, clip.updatedAt);
    return clip;
}
async function getClipById(clipId) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM clips WHERE id = ? LIMIT 1;`, [clipId]);
    if (!rows[0])
        return null;
    return rowToClip(rows[0]);
}
async function listClips(limit = 40) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM clips WHERE hidden = 0 ORDER BY createdAt DESC LIMIT ?;`, [limit]);
    return rows.map(rowToClip);
}
async function listClipsInRange(startMs, endMs) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM clips WHERE hidden = 0 AND createdAt >= ? AND createdAt < ? ORDER BY createdAt ASC;`, [startMs, endMs]);
    return rows.map(rowToClip);
}
async function hideClip(clipId) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    await (0, db_1.exec)(d, `UPDATE clips SET hidden = 1, updatedAt = ? WHERE id = ?;`, [now, clipId]);
    const rows = await (0, db_1.query)(d, `SELECT * FROM clips WHERE id = ? LIMIT 1;`, [clipId]);
    if (rows[0]) {
        const c = rowToClip(rows[0]);
        await (0, enqueue_1.enqueueHide)('clips', c.id, {
            id: c.id,
            createdAt: c.createdAt,
            updatedAt: now,
            userId: c.userId,
            displayName: c.displayName,
            templateId: c.templateId,
            title: c.title,
            durationMs: c.durationMs,
            videoUri: '',
            thumbnailUri: c.thumbnailUri ?? null,
            score: c.score,
            metrics: c.metrics ?? {},
            hidden: true,
        }, now);
    }
}
