"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFeedbackRequest = createFeedbackRequest;
exports.listFeedbackForCoach = listFeedbackForCoach;
exports.getFeedbackById = getFeedbackById;
exports.replyToFeedback = replyToFeedback;
const db_1 = require("@/core/storage/db");
const id_1 = require("@/core/util/id");
function rowToFeedback(r) {
    return {
        id: r.id,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        coachId: r.coachId,
        coachName: r.coachName,
        studentId: r.studentId,
        studentName: r.studentName,
        clipId: r.clipId ?? null,
        message: r.message,
        response: r.response ?? null,
        status: r.status,
    };
}
async function createFeedbackRequest(input) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    const f = {
        id: (0, id_1.id)('fbk'),
        createdAt: now,
        updatedAt: now,
        coachId: input.coachId,
        coachName: input.coachName,
        studentId: input.studentId,
        studentName: input.studentName,
        clipId: input.clipId ?? null,
        message: input.message,
        response: null,
        status: 'open',
    };
    await (0, db_1.exec)(d, `INSERT INTO feedback (id, createdAt, updatedAt, coachId, coachName, studentId, studentName, clipId, message, response, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'open');`, [f.id, f.createdAt, f.updatedAt, f.coachId, f.coachName, f.studentId, f.studentName, f.clipId, f.message]);
    return f;
}
async function listFeedbackForCoach(coachId, limit = 50) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM feedback WHERE coachId = ? ORDER BY updatedAt DESC LIMIT ?;`, [coachId, limit]);
    return rows.map(rowToFeedback);
}
async function getFeedbackById(id) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM feedback WHERE id = ? LIMIT 1;`, [id]);
    return rows[0] ? rowToFeedback(rows[0]) : null;
}
async function replyToFeedback(id, response) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    await (0, db_1.exec)(d, `UPDATE feedback SET response = ?, status = 'done', updatedAt = ? WHERE id = ?;`, [response, now, id]);
    return await getFeedbackById(id);
}
