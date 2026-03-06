"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertBestTakeForAttempt = upsertBestTakeForAttempt;
exports.getBestTakeAttemptId = getBestTakeAttemptId;
exports.listBestTakeAttemptIdsForSession = listBestTakeAttemptIdsForSession;
const db_1 = require("./db");
/**
 * Upserts the best-take for a given (sessionId, drillId).
 * Only replaces if the new score is >= the existing best score.
 *
 * Important: this is implemented as a single UPSERT with a WHERE clause
 * so it is race-safe (no read-then-write window).
 */
async function upsertBestTakeForAttempt(input) {
    const d = await (0, db_1.getDb)();
    const row = {
        sessionId: input.sessionId,
        drillId: input.drillId,
        attemptId: input.attemptId,
        score: input.score,
        updatedAt: Date.now(),
    };
    await (0, db_1.exec)(d, `INSERT INTO best_takes (sessionId, drillId, attemptId, score, updatedAt)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(sessionId, drillId) DO UPDATE SET
       attemptId = excluded.attemptId,
       score = excluded.score,
       updatedAt = excluded.updatedAt
     WHERE excluded.score >= best_takes.score;`, [row.sessionId, row.drillId, row.attemptId, row.score, row.updatedAt]);
    // Return the current row (whether updated or not).
    const cur = await (0, db_1.query)(d, `SELECT * FROM best_takes WHERE sessionId = ? AND drillId = ? LIMIT 1;`, [
        row.sessionId,
        row.drillId,
    ]);
    return cur?.[0] ?? row;
}
async function getBestTakeAttemptId(sessionId, drillId) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT attemptId FROM best_takes WHERE sessionId = ? AND drillId = ? LIMIT 1;`, [
        sessionId,
        drillId,
    ]);
    return rows[0]?.attemptId ? String(rows[0].attemptId) : null;
}
/**
 * Returns mapping of drillId -> attemptId for a session.
 */
async function listBestTakeAttemptIdsForSession(sessionId) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT drillId, attemptId FROM best_takes WHERE sessionId = ?;`, [sessionId]);
    const out = {};
    for (const r of rows) {
        if (r?.drillId && r?.attemptId)
            out[String(r.drillId)] = String(r.attemptId);
    }
    return out;
}
