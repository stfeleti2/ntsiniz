"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const trainingCsv_1 = require("../share/trainingCsv");
(0, node_test_1.default)("buildTrainingCsv: includes header + escapes commas/newlines/quotes", () => {
    const csv = (0, trainingCsv_1.buildTrainingCsv)({
        sessions: [{ id: "s1", startedAt: 0, avgScore: 80 }],
        attempts: [
            {
                sessionId: "s1",
                drillId: "drill,1",
                score: 88,
                createdAt: Date.parse("2026-02-15T10:00:00.000Z"),
                metrics: { drillType: "match_note", avgAbsCents: 12.3, wobbleCents: 9.9, voicedRatio: 0.95, confidenceAvg: 0.88, timeToEnterMs: 900 },
            },
            {
                sessionId: "s1",
                drillId: "drill-2",
                score: 70,
                createdAt: Date.parse("2026-02-15T10:01:00.000Z"),
                metrics: { drillType: "interval", avgAbsCents: 33.3, wobbleCents: 20.1 },
            },
        ],
    });
    const [header, row1, row2] = csv.split("\n");
    strict_1.default.ok(header.startsWith("date,sessionId,sessionAvg,drillId"));
    // drillId contains a comma -> must be quoted
    strict_1.default.ok(row1.includes('"drill,1"'));
    // row count should be header + 2 rows
    strict_1.default.equal(csv.split("\n").length, 3);
    // sessionAvg should be present
    strict_1.default.ok(row2.includes(",80,"));
});
