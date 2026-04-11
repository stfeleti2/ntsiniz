"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const drillScoring_1 = require("../scoring/drillScoring");
(0, node_test_1.default)("interval scoring rewards correct interval", () => {
    const base = {
        drillType: "interval",
        tuneWindowCents: 25,
        holdMs: 900,
        timeToEnterMs: 1500,
        meanCents: 3,
        avgAbsCents: 14,
        wobbleCents: 10,
        voicedRatio: 0.9,
        confidenceAvg: 0.9,
    };
    const good = (0, drillScoring_1.scoreAttempt)({ ...base, intervalErrorCents: 12 });
    const bad = (0, drillScoring_1.scoreAttempt)({ ...base, intervalErrorCents: 180 });
    strict_1.default.ok(good > bad);
    strict_1.default.ok(good >= 70);
});
