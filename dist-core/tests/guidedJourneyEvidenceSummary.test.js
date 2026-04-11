"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const v6Selectors_1 = require("../guidedJourney/v6Selectors");
(0, node_test_1.default)('guided evidence summary aggregates rubric dimensions, blocked gates, and family usage', () => {
    const summary = (0, v6Selectors_1.summarizeGuidedAttemptEvidence)([
        {
            id: 'att_1',
            createdAt: Date.now(),
            sessionId: 'sess_1',
            drillId: 'host_1',
            score: 84,
            metrics: {
                guidedJourney: {
                    family: 'match_note',
                    blockedBy: ['technical gate'],
                    rubricDimensions: {
                        technique_accuracy: 86,
                        stability_repeatability: 78,
                    },
                },
            },
        },
        {
            id: 'att_2',
            createdAt: Date.now() + 1,
            sessionId: 'sess_1',
            drillId: 'host_2',
            score: 76,
            metrics: {
                guidedJourney: {
                    family: 'match_note',
                    blockedBy: ['technical gate', 'transfer gate'],
                    rubricDimensions: {
                        technique_accuracy: 82,
                        transfer_application: 69,
                    },
                },
            },
        },
        {
            id: 'att_3',
            createdAt: Date.now() + 2,
            sessionId: 'sess_1',
            drillId: 'host_3',
            score: 88,
            metrics: {
                guidedJourney: {
                    family: 'melody_echo',
                    rubricDimensions: {
                        stylism_communication: 91,
                        transfer_application: 81,
                    },
                },
            },
        },
    ]);
    strict_1.default.equal(summary.averageScore, 83);
    strict_1.default.equal(summary.strongestDimensions[0]?.id, 'stylism_communication');
    strict_1.default.equal(summary.weakestDimensions[0]?.id, 'transfer_application');
    strict_1.default.equal(summary.blockedGates[0]?.id, 'technical gate');
    strict_1.default.equal(summary.recentFamilies[0]?.id, 'match_note');
});
