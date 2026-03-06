"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.finishSession = finishSession;
exports.listSessions = listSessions;
exports.listSessionAggregates = listSessionAggregates;
exports.getSession = getSession;
exports.listSessionAggregatesInRange = listSessionAggregatesInRange;
const db_1 = require("./db");
const id_1 = require("../util/id");
async function createSession() {
    const d = await (0, db_1.getDb)();
    const s = { id: (0, id_1.id)("sess"), startedAt: Date.now(), endedAt: null, tip: null, summary: null };
    await (0, db_1.exec)(d, `INSERT INTO sessions (id, startedAt, endedAt, tip, summary) VALUES (?, ?, ?, ?, ?);`, [
        s.id,
        s.startedAt,
        s.endedAt,
        s.tip,
        s.summary,
    ]);
    return s;
}
async function finishSession(sessionId, tip, summary) {
    const d = await (0, db_1.getDb)();
    const endedAt = Date.now();
    await (0, db_1.exec)(d, `UPDATE sessions SET endedAt = ?, tip = ?, summary = ? WHERE id = ?;`, [endedAt, tip, summary, sessionId]);
}
async function listSessions(limit = 30) {
    const d = await (0, db_1.getDb)();
    return await (0, db_1.query)(d, `SELECT * FROM sessions ORDER BY startedAt DESC LIMIT ?;`, [limit]);
}
/**
 * Returns sessions (oldest -> newest) with average attempt score.
 * Designed for progress charts & milestone comparisons without N+1 queries.
 */
async function listSessionAggregates(limit = 90) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `
      SELECT
        s.id as id,
        s.startedAt as startedAt,
        s.endedAt as endedAt,
        COALESCE(AVG(a.score), 0) as avgScore,
        COUNT(a.id) as attemptCount
      FROM sessions s
      LEFT JOIN attempts a ON a.sessionId = s.id
      GROUP BY s.id
      ORDER BY s.startedAt ASC
      LIMIT ?;
    `, [limit]);
    return rows.map((r) => ({
        id: String(r.id),
        startedAt: Number(r.startedAt),
        endedAt: r.endedAt == null ? null : Number(r.endedAt),
        avgScore: Number(r.avgScore),
        attemptCount: Number(r.attemptCount),
    }));
}
async function getSession(sessionId) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM sessions WHERE id = ? LIMIT 1;`, [sessionId]);
    return rows[0] ?? null;
}
async function listSessionAggregatesInRange(startMs, endMs) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `
      SELECT
        s.id as id,
        s.startedAt as startedAt,
        s.endedAt as endedAt,
        COALESCE(AVG(a.score), 0) as avgScore,
        COUNT(a.id) as attemptCount
      FROM sessions s
      LEFT JOIN attempts a ON a.sessionId = s.id
      WHERE s.startedAt >= ? AND s.startedAt < ?
      GROUP BY s.id
      ORDER BY s.startedAt ASC;
    `, [startMs, endMs]);
    return rows.map((r) => ({
        id: String(r.id),
        startedAt: Number(r.startedAt),
        endedAt: r.endedAt == null ? null : Number(r.endedAt),
        avgScore: Number(r.avgScore),
        attemptCount: Number(r.attemptCount),
    }));
}
