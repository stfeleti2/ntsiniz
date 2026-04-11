"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const phraseGrader_1 = require("../scoring/phraseGrader");
(0, node_test_1.default)('gradePhraseFromMetrics: perfect phrase', () => {
    const g = (0, phraseGrader_1.gradePhraseFromMetrics)({ avgAbsCents: 8, wobbleCents: 7, voicedRatio: 0.9, timeToEnterMs: 800, confidenceAvg: 0.95 });
    strict_1.default.equal(g.label, 'perfect');
    strict_1.default.ok(g.score > 0.85);
});
(0, node_test_1.default)('gradePhraseFromMetrics: try again phrase', () => {
    const g = (0, phraseGrader_1.gradePhraseFromMetrics)({ avgAbsCents: 60, wobbleCents: 38, voicedRatio: 0.35, timeToEnterMs: 4200, confidenceAvg: 0.9 });
    strict_1.default.equal(g.label, 'tryAgain');
    strict_1.default.ok(g.score < 0.55);
});
