"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertCompetitionSubmission = upsertCompetitionSubmission;
exports.listCompetitionLeaderboard = listCompetitionLeaderboard;
exports.getMyCompetitionSubmission = getMyCompetitionSubmission;
exports.hideCompetitionSubmission = hideCompetitionSubmission;
const db_1 = require("@/core/storage/db");
const id_1 = require("@/core/util/id");
const antiCheat_1 = require("./antiCheat");
function rowToSubmission(r) {
    return {
        id: r.id,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        competitionId: r.competitionId,
        roundId: r.roundId,
        userId: r.userId,
        displayName: r.displayName,
        clipId: r.clipId,
        score: r.score,
        durationMs: r.durationMs ?? undefined,
        avgConfidence: r.avgConfidence ?? undefined,
        framesAnalyzed: r.framesAnalyzed ?? undefined,
        strictness: r.strictness ?? undefined,
        deviceClass: (r.deviceClass ?? undefined),
        notes: r.notes ?? null,
        source: r.source,
        hidden: !!r.hidden,
    };
}
async function upsertCompetitionSubmission(input) {
    const v = (0, antiCheat_1.validateSubmission)({ score: input.score, displayName: input.displayName, clipId: input.clipId });
    if (!v.ok) {
        (0, antiCheat_1.reportAntiCheat)(v.reason, { competitionId: input.competitionId, roundId: input.roundId, userId: input.userId });
        throw new Error(`Invalid submission: ${v.reason}`);
    }
    const pm = (0, antiCheat_1.validateProofMeta)({
        durationMs: input.durationMs,
        avgConfidence: input.avgConfidence,
        framesAnalyzed: input.framesAnalyzed,
        strictness: input.strictness,
        deviceClass: input.deviceClass,
    });
    if (!pm.ok) {
        (0, antiCheat_1.reportAntiCheat)(pm.reason, { competitionId: input.competitionId, roundId: input.roundId, userId: input.userId });
        throw new Error(`Invalid submission meta: ${pm.reason}`);
    }
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    // One submission per user per competition round.
    const existing = await (0, db_1.query)(d, `SELECT * FROM competition_submissions WHERE competitionId = ? AND roundId = ? AND userId = ? LIMIT 1;`, [input.competitionId, input.roundId, input.userId]);
    if (existing[0]) {
        await (0, db_1.exec)(d, `UPDATE competition_submissions
         SET updatedAt = ?, clipId = ?, score = ?, notes = ?, displayName = ?,
             durationMs = ?, avgConfidence = ?, framesAnalyzed = ?, strictness = ?, deviceClass = ?,
             hidden = 0
       WHERE id = ?;`, [
            now,
            input.clipId,
            input.score,
            input.notes ?? null,
            input.displayName,
            input.durationMs ?? null,
            input.avgConfidence ?? null,
            input.framesAnalyzed ?? null,
            input.strictness ?? null,
            input.deviceClass ?? 'unknown',
            existing[0].id,
        ]);
        const rows = await (0, db_1.query)(d, `SELECT * FROM competition_submissions WHERE id = ? LIMIT 1;`, [existing[0].id]);
        return rowToSubmission(rows[0]);
    }
    const sub = {
        id: (0, id_1.id)('csub'),
        createdAt: now,
        updatedAt: now,
        competitionId: input.competitionId,
        roundId: input.roundId,
        userId: input.userId,
        displayName: input.displayName,
        clipId: input.clipId,
        score: input.score,
        durationMs: input.durationMs,
        avgConfidence: input.avgConfidence,
        framesAnalyzed: input.framesAnalyzed,
        strictness: input.strictness,
        deviceClass: input.deviceClass ?? 'unknown',
        notes: input.notes ?? null,
        source: input.source,
        hidden: false,
    };
    await (0, db_1.exec)(d, `INSERT INTO competition_submissions (
        id, createdAt, updatedAt, competitionId, roundId, userId, displayName, clipId, score,
        durationMs, avgConfidence, framesAnalyzed, strictness, deviceClass,
        notes, source, hidden
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`, [
        sub.id,
        sub.createdAt,
        sub.updatedAt,
        sub.competitionId,
        sub.roundId,
        sub.userId,
        sub.displayName,
        sub.clipId,
        sub.score,
        sub.durationMs ?? null,
        sub.avgConfidence ?? null,
        sub.framesAnalyzed ?? null,
        sub.strictness ?? null,
        sub.deviceClass ?? 'unknown',
        sub.notes ?? null,
        sub.source,
    ]);
    return sub;
}
async function listCompetitionLeaderboard(input) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM competition_submissions WHERE competitionId = ? AND roundId = ? AND hidden = 0 ORDER BY score DESC, updatedAt DESC LIMIT ?;`, [input.competitionId, input.roundId, input.limit ?? 50]);
    return rows.map(rowToSubmission);
}
async function getMyCompetitionSubmission(input) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM competition_submissions WHERE competitionId = ? AND roundId = ? AND userId = ? AND hidden = 0 LIMIT 1;`, [input.competitionId, input.roundId, input.userId]);
    return rows[0] ? rowToSubmission(rows[0]) : null;
}
async function hideCompetitionSubmission(params) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    await (0, db_1.exec)(d, `UPDATE competition_submissions SET hidden = 1, updatedAt = ? WHERE id = ?;`, [now, params.submissionId]);
    // Best-effort: audit
    try {
        const { addAuditEntry } = await import('../mod/auditRepo.js');
        await addAuditEntry({ actorId: params.actorId, actorName: params.actorName, action: 'competition_submission_hide', targetKind: 'competition_submission', targetId: params.submissionId, meta: { reason: params.reason } });
    }
    catch {
        // ignore
    }
}
