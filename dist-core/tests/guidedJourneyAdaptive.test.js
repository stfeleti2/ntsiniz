"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const adaptiveCore_1 = require("../guidedJourney/adaptiveCore");
(0, node_test_1.default)('adaptive reducer turns on help mode after repeated low scores', () => {
    let state = adaptiveCore_1.DEFAULT_ADAPTIVE_STATE;
    for (let index = 0; index < 5; index += 1) {
        state = (0, adaptiveCore_1.adaptiveReducer)(state, {
            type: 'ATTEMPT_RECORDED',
            payload: {
                score: 42,
                drillId: `D${index}`,
                family: 'match_note',
                meanAbsCents: 34,
                biasCents: -20,
                voicedRatio: 0.44,
                timestamp: Date.now() + index,
            },
        });
    }
    strict_1.default.equal(state.helpMode, true);
    strict_1.default.ok(state.voiceProfile.tags.includes('always_flat'));
    strict_1.default.equal(state.lastRecommendedBundleId, 'RB2');
});
(0, node_test_1.default)('adaptive reducer recommends route-biased family when tags are quiet', () => {
    const state = (0, adaptiveCore_1.adaptiveReducer)({ ...adaptiveCore_1.DEFAULT_ADAPTIVE_STATE, routeId: 'R3' }, {
        type: 'ATTEMPT_RECORDED',
        payload: {
            score: 80,
            drillId: 'D100',
            family: 'match_note',
            meanAbsCents: 9,
            biasCents: 2,
            voicedRatio: 0.9,
            timestamp: Date.now(),
        },
    });
    strict_1.default.equal(state.lastRecommendedFamily, 'confidence_rep');
});
(0, node_test_1.default)('adaptive reducer turns on recovery mode after repeated high-load score collapse', () => {
    let state = adaptiveCore_1.DEFAULT_ADAPTIVE_STATE;
    for (let index = 0; index < 3; index += 1) {
        state = (0, adaptiveCore_1.adaptiveReducer)(state, {
            type: 'ATTEMPT_RECORDED',
            payload: {
                score: 82 - index * 18,
                drillId: `LT${index}`,
                family: 'performance_run',
                voicedRatio: 0.78,
                loadTier: 'LT3',
                timestamp: Date.now() + index,
            },
        });
    }
    strict_1.default.equal(state.recoveryMode, true);
    strict_1.default.ok(state.voiceProfile.tags.includes('fatigue_risk'));
});
