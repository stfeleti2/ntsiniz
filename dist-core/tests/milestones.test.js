"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const milestones_js_1 = require("../progress/milestones.js");
(0, node_test_1.default)("computeMilestones picks baseline/day7/day30 sensibly", () => {
    const day = 24 * 60 * 60 * 1000;
    const t0 = Date.UTC(2026, 0, 1, 12, 0, 0); // Jan 1 2026 noon
    const aggs = [
        { id: "s0", startedAt: t0, avgScore: 50, attemptCount: 3 },
        { id: "s1", startedAt: t0 + 6 * day, avgScore: 60, attemptCount: 3 },
        { id: "s2", startedAt: t0 + 7 * day, avgScore: 65, attemptCount: 3 },
        { id: "s3", startedAt: t0 + 31 * day, avgScore: 80, attemptCount: 3 },
    ];
    const ms = (0, milestones_js_1.computeMilestones)(aggs);
    strict_1.default.equal(ms.baseline?.score, 50);
    strict_1.default.equal(ms.latest?.score, 80);
    // Day 7 should be near the 7th day session
    strict_1.default.equal(ms.day7?.score, 65);
    // Day 30 target is Jan 31; closest here is day 31
    strict_1.default.equal(ms.day30?.score, 80);
});
