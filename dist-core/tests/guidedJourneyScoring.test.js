"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const scoringAdapter_1 = require("../guidedJourney/scoringAdapter");
(0, node_test_1.default)('guided scoring adapter returns a pass band for a strong match-note attempt', () => {
    const result = (0, scoringAdapter_1.scoreGuidedAttempt)({
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
        assessmentEvidence: { technical: true, transfer: true, health: true },
        pressureLadderStep: 'single note with light visual reward',
    });
    strict_1.default.equal(result.family, 'match_note');
    strict_1.default.equal(result.passed, true);
    strict_1.default.ok(result.finalScore >= 72);
    strict_1.default.ok((result.rubricDimensions.technique_accuracy ?? 0) >= 72);
    strict_1.default.equal(result.gateStatus.transfer, true);
});
(0, node_test_1.default)('guided scoring adapter caps low-confidence results', () => {
    const result = (0, scoringAdapter_1.scoreGuidedAttempt)({
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
(0, node_test_1.default)('guided scoring adapter emits blocked gates for weak transfer reps', () => {
    const result = (0, scoringAdapter_1.scoreGuidedAttempt)({
        drillId: 'D999',
        metrics: {
            drillType: 'melody_echo',
            avgAbsCents: 28,
            meanCents: -12,
            wobbleCents: 26,
            voicedRatio: 0.62,
            confidenceAvg: 0.58,
            timeToEnterMs: 1600,
            melodyHitRate: 0.42,
            contourHitRate: 0.48,
        },
        assessmentEvidence: { transfer: true, styleOrCommunication: true },
        scoringLogic: {
            rubricDimensions: ['technique_accuracy', 'transfer_application', 'stylism_communication'],
            styleOrCommunicationWeight: 0.25,
        },
        masteryThreshold: 80,
        pressureLadderStep: 'one-take stylism rep',
    });
    strict_1.default.equal(result.passed, false);
    strict_1.default.ok(result.blockedBy.includes('technical gate') || result.blockedBy.includes('transfer gate'));
    strict_1.default.ok((result.rubricDimensions.transfer_application ?? 0) > 0);
});
(0, node_test_1.default)('guided scoring adapter treats advanced families as fully supported', () => {
    const result = (0, scoringAdapter_1.scoreGuidedAttempt)({
        drillId: 'D201',
        metrics: {
            drillType: 'melody_echo',
            avgAbsCents: 16,
            meanCents: -4,
            wobbleCents: 12,
            voicedRatio: 0.86,
            confidenceAvg: 0.8,
            timeToEnterMs: 820,
            melodyHitRate: 0.74,
            contourHitRate: 0.78,
        },
        packFamily: 'phrase_sing',
        assessmentEvidence: { transfer: true, styleOrCommunication: true },
        masteryThreshold: 75,
    });
    strict_1.default.equal(result.family, 'phrase_sing');
    strict_1.default.equal(result.supported, true);
    strict_1.default.ok(result.finalScore >= 70);
    strict_1.default.ok((result.rubricDimensions.stylism_communication ?? 0) > 0);
});
