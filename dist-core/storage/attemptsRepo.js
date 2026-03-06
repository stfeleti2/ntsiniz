"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAttempt = addAttempt;
exports.addAttemptAndUpdateBestTake = addAttemptAndUpdateBestTake;
exports.listAttemptsBySession = listAttemptsBySession;
exports.getAttemptById = getAttemptById;
exports.listAttemptsByDrill = listAttemptsByDrill;
exports.listRecentAttempts = listRecentAttempts;
exports.listAttemptsInRange = listAttemptsInRange;
const db_1 = require("./db");
const id_1 = require("../util/id");
const bestTakesRepo_1 = require("./bestTakesRepo");
async function addAttempt(input) {
    const d = await (0, db_1.getDb)();
    const a = {
        id: (0, id_1.id)("att"),
        createdAt: Date.now(),
        sessionId: input.sessionId,
        drillId: input.drillId,
        score: input.score,
        metrics: input.metrics,
    };
    await (0, db_1.exec)(d, `INSERT INTO attempts (id, createdAt, sessionId, drillId, score, metrics, durationMs, avgConfidence, framesAnalyzed, strictness, deviceClass) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, [
        a.id,
        a.createdAt,
        a.sessionId,
        a.drillId,
        a.score,
        JSON.stringify(a.metrics ?? {}),
        a.metrics?.durationMs != null || a.metrics?.duration != null ? Number(a.metrics?.durationMs ?? a.metrics?.duration) : null,
        typeof a.metrics?.avgConfidence === 'number' ? a.metrics.avgConfidence : null,
        typeof a.metrics?.framesAnalyzed === 'number' ? a.metrics.framesAnalyzed : null,
        typeof a.metrics?.strictness === 'number' ? a.metrics.strictness : null,
        typeof a.metrics?.deviceClass === 'string' ? a.metrics.deviceClass : null,
    ]);
    return a;
}
/**
 * Adds an attempt and best-take mapping (best-effort).
 *
 * Why: DrillScreen previously swallowed best-take errors, which could silently
 * break "best take" UX and progress proof. This keeps attempt persistence
 * reliable while making best-take correctness observable.
 */
async function addAttemptAndUpdateBestTake(input) {
    const attempt = await addAttempt(input);
    // Best-take is not critical-path for attempt persistence.
    // If it fails, callers should log/capture the error.
    const bestTake = await (0, bestTakesRepo_1.upsertBestTakeForAttempt)({
        sessionId: attempt.sessionId,
        drillId: attempt.drillId,
        attemptId: attempt.id,
        score: attempt.score,
    });
    return { attempt, bestTake };
}
async function listAttemptsBySession(sessionId) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM attempts WHERE sessionId = ? ORDER BY createdAt ASC;`, [sessionId]);
    return rows.map((r) => ({ ...r, metrics: safeParse(r.metrics) }));
}
async function getAttemptById(attemptId) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM attempts WHERE id = ? LIMIT 1;`, [attemptId]);
    if (!rows[0])
        return null;
    const r = rows[0];
    return { ...r, metrics: safeParse(r.metrics) };
}
async function listAttemptsByDrill(drillId, limit = 50) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM attempts WHERE drillId = ? ORDER BY createdAt DESC LIMIT ?;`, [drillId, limit]);
    return rows.map((r) => ({ ...r, metrics: safeParse(r.metrics) }));
}
async function listRecentAttempts(limit = 200) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM attempts ORDER BY createdAt DESC LIMIT ?;`, [limit]);
    return rows.map((r) => ({ ...r, metrics: safeParse(r.metrics) }));
}
async function listAttemptsInRange(startMs, endMs) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM attempts WHERE createdAt >= ? AND createdAt < ? ORDER BY createdAt ASC;`, [startMs, endMs]);
    return rows.map((r) => ({ ...r, metrics: safeParse(r.metrics) }));
}
function safeParse(v) {
    try {
        return typeof v === "string" ? JSON.parse(v) : v;
    }
    catch {
        return {};
    }
}
