"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTrainingCsv = buildTrainingCsv;
function csvEscape(v) {
    const s = String(v ?? "");
    if (/[\n\r,"]/g.test(s))
        return `"${s.replace(/"/g, '""')}"`;
    return s;
}
function buildTrainingCsv(params) {
    const { sessions, attempts } = params;
    const sessionById = new Map();
    for (const s of sessions) {
        sessionById.set(s.id, {
            startedAt: s.startedAt,
            endedAt: s.endedAt ?? null,
            avgScore: Math.round(s.avgScore),
        });
    }
    const header = [
        "date",
        "sessionId",
        "sessionAvg",
        "drillId",
        "drillType",
        "score",
        "avgAbsCents",
        "wobbleCents",
        "voicedRatio",
        "confidenceAvg",
        "timeToEnterMs",
    ];
    const rows = attempts.map((a) => {
        const s = sessionById.get(a.sessionId);
        const date = new Date(a.createdAt).toISOString();
        const m = a.metrics ?? {};
        return [
            date,
            a.sessionId,
            s ? s.avgScore : "",
            a.drillId,
            m.drillType ?? "",
            a.score,
            m.avgAbsCents ?? "",
            m.wobbleCents ?? "",
            m.voicedRatio ?? "",
            m.confidenceAvg ?? "",
            m.timeToEnterMs ?? "",
        ];
    });
    return [header.join(","), ...rows.map((r) => r.map(csvEscape).join(","))].join("\n");
}
