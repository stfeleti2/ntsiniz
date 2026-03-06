"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCompletedDays = parseCompletedDays;
exports.enrollInProgram = enrollInProgram;
exports.getEnrollment = getEnrollment;
exports.listMyEnrollments = listMyEnrollments;
exports.markProgramDayComplete = markProgramDayComplete;
const db_1 = require("@/core/storage/db");
const id_1 = require("@/core/util/id");
const safeJson_1 = require("@/core/utils/safeJson");
function rowToEnrollment(r) {
    return {
        id: r.id,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        userId: r.userId,
        programId: r.programId,
        coachId: r.coachId,
        currentDay: r.currentDay,
        completedDaysJson: r.completedDaysJson,
    };
}
function parseCompletedDays(json) {
    try {
        const v = (0, safeJson_1.safeJsonParse)(json, {});
        if (Array.isArray(v))
            return v.filter((x) => typeof x === 'number');
    }
    catch { }
    return [];
}
async function enrollInProgram(input) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM enrollments WHERE userId = ? AND programId = ? LIMIT 1;`, [input.userId, input.programId]);
    const now = Date.now();
    if (rows[0]) {
        await (0, db_1.exec)(d, `UPDATE enrollments SET updatedAt = ?, coachId = ? WHERE id = ?;`, [now, input.coachId, rows[0].id]);
        const r2 = await (0, db_1.query)(d, `SELECT * FROM enrollments WHERE id = ? LIMIT 1;`, [rows[0].id]);
        return rowToEnrollment(r2[0]);
    }
    const e = {
        id: (0, id_1.id)('enr'),
        createdAt: now,
        updatedAt: now,
        userId: input.userId,
        programId: input.programId,
        coachId: input.coachId,
        currentDay: 1,
        completedDaysJson: JSON.stringify([]),
    };
    await (0, db_1.exec)(d, `INSERT INTO enrollments (id, createdAt, updatedAt, userId, programId, coachId, currentDay, completedDaysJson)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, [e.id, e.createdAt, e.updatedAt, e.userId, e.programId, e.coachId, e.currentDay, e.completedDaysJson]);
    return e;
}
async function getEnrollment(userId, programId) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM enrollments WHERE userId = ? AND programId = ? LIMIT 1;`, [userId, programId]);
    return rows[0] ? rowToEnrollment(rows[0]) : null;
}
async function listMyEnrollments(userId) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM enrollments WHERE userId = ? ORDER BY updatedAt DESC;`, [userId]);
    return rows.map(rowToEnrollment);
}
async function markProgramDayComplete(input) {
    const d = await (0, db_1.getDb)();
    const e = await getEnrollment(input.userId, input.programId);
    if (!e)
        return null;
    const completed = new Set(parseCompletedDays(e.completedDaysJson));
    completed.add(input.day);
    const nextDay = Math.max(e.currentDay, input.day + 1);
    const now = Date.now();
    await (0, db_1.exec)(d, `UPDATE enrollments SET updatedAt = ?, currentDay = ?, completedDaysJson = ? WHERE id = ?;`, [now, nextDay, JSON.stringify([...completed].sort((a, b) => a - b)), e.id]);
    const rows = await (0, db_1.query)(d, `SELECT * FROM enrollments WHERE id = ? LIMIT 1;`, [e.id]);
    return rows[0] ? rowToEnrollment(rows[0]) : null;
}
