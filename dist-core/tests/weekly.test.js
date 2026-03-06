"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const weekly_js_1 = require("../progress/weekly.js");
(0, node_test_1.default)("computeWeeklyReport calculates deltas and daily averages", () => {
    const day = 24 * 60 * 60 * 1000;
    const weekStart = Date.UTC(2026, 0, 5, 0, 0, 0); // Mon
    const aggs = [
        { id: "a", startedAt: weekStart + 0 * day + 10_000, endedAt: weekStart + 0 * day + 70_000, avgScore: 60, attemptCount: 3 },
        { id: "b", startedAt: weekStart + 2 * day + 10_000, endedAt: weekStart + 2 * day + 130_000, avgScore: 70, attemptCount: 3 },
    ];
    const attemptsThis = [
        { id: "1", createdAt: weekStart + 10_000, sessionId: "a", drillId: "match_note", score: 60, metrics: { drillType: "match_note", avgAbsCents: 18, wobbleCents: 12, voicedRatio: 0.7, confidenceAvg: 0.9, timeToEnterMs: 1500 } },
        { id: "2", createdAt: weekStart + 20_000, sessionId: "a", drillId: "match_note", score: 60, metrics: { drillType: "match_note", avgAbsCents: 20, wobbleCents: 13, voicedRatio: 0.65, confidenceAvg: 0.9, timeToEnterMs: 1700 } },
        { id: "3", createdAt: weekStart + 30_000, sessionId: "b", drillId: "sustain", score: 80, metrics: { drillType: "sustain", avgAbsCents: 10, wobbleCents: 8, voicedRatio: 0.8, confidenceAvg: 0.95, timeToEnterMs: 1200 } },
    ];
    const attemptsPrev = [
        { id: "p1", createdAt: weekStart - day + 10_000, sessionId: "p", drillId: "match_note", score: 50, metrics: { drillType: "match_note", avgAbsCents: 28, wobbleCents: 16, voicedRatio: 0.6, confidenceAvg: 0.85, timeToEnterMs: 2100 } },
        { id: "p2", createdAt: weekStart - day + 20_000, sessionId: "p", drillId: "sustain", score: 60, metrics: { drillType: "sustain", avgAbsCents: 18, wobbleCents: 12, voicedRatio: 0.7, confidenceAvg: 0.9, timeToEnterMs: 1800 } },
    ];
    const wk = (0, weekly_js_1.computeWeeklyReport)({
        weekStartMs: weekStart,
        aggs,
        attempts: attemptsThis,
        prevAttempts: attemptsPrev,
    });
    strict_1.default.equal(wk.sessions, 2);
    strict_1.default.equal(wk.activeDays, 2);
    strict_1.default.equal(wk.bestStreakDays, 1);
    strict_1.default.equal(wk.avgScore, 67); // avg(60,60,80)=66.6
    strict_1.default.equal(wk.vsPrevWeekDelta, 12); // this 67 - prev avg(50,60)=55 => 12
    strict_1.default.ok(typeof wk.accuracyDeltaCents === "number");
    strict_1.default.ok(Array.isArray(wk.drillTypeBreakdown));
    strict_1.default.deepEqual(wk.dailyAverages.map((d) => d.avgScore), [60, 70]);
});
