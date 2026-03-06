"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const drillScoring_js_1 = require("../scoring/drillScoring.js");
(0, node_test_1.default)("scoreAttempt: good attempt scores high", () => {
    const score = (0, drillScoring_js_1.scoreAttempt)({
        drillType: "match_note",
        tuneWindowCents: 25,
        holdMs: 900,
        timeToEnterMs: 1200,
        meanCents: 2,
        avgAbsCents: 8,
        wobbleCents: 6,
        driftCentsPerSec: 0.5,
        overshootRate: 0.05,
        voicedRatio: 0.9,
        confidenceAvg: 0.9,
    });
    strict_1.default.ok(score >= 80);
});
(0, node_test_1.default)("scoreAttempt: poor attempt scores low", () => {
    const score = (0, drillScoring_js_1.scoreAttempt)({
        drillType: "match_note",
        tuneWindowCents: 25,
        holdMs: 900,
        timeToEnterMs: 6500,
        meanCents: -35,
        avgAbsCents: 55,
        wobbleCents: 30,
        driftCentsPerSec: 8,
        overshootRate: 0.4,
        voicedRatio: 0.3,
        confidenceAvg: 0.3,
    });
    strict_1.default.ok(score <= 45);
});
