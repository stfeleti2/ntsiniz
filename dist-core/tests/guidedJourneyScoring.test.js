"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const scoringAdapter_js_1 = require("../guidedJourney/scoringAdapter.js");
(0, node_test_1.default)('guided scoring adapter returns a pass band for a strong match-note attempt', () => {
    const result = (0, scoringAdapter_js_1.scoreGuidedAttempt)({
        drillId: 'D001',
        metrics: {
            drillType: 'match_note',
            avgAbsCents: 8,
            meanCents: 1,
            wobbleCents: 7,
            voicedRatio: 0.92,
            confidenceAvg: 0.88,
            timeToEnterMs: 420,
            overshootRate: 0.04,
        },
    });
    strict_1.default.equal(result.family, 'match_note');
    strict_1.default.equal(result.passed, true);
    strict_1.default.ok(result.finalScore >= 72);
});
(0, node_test_1.default)('guided scoring adapter caps low-confidence results', () => {
    const result = (0, scoringAdapter_js_1.scoreGuidedAttempt)({
        drillId: 'D001',
        metrics: {
            drillType: 'match_note',
            avgAbsCents: 10,
            meanCents: 0,
            wobbleCents: 8,
            voicedRatio: 0.9,
            confidenceAvg: 0.22,
            timeToEnterMs: 500,
            overshootRate: 0.05,
        },
    });
    strict_1.default.ok(result.finalScore <= 45);
});
