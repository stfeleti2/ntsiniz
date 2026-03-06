"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const feedbackPolicy_js_1 = require("../coaching/feedbackPolicy.js");
(0, node_test_1.default)('resolveFeedbackPlan: beginner stays forgiving but tightens over weeks', () => {
    const w1 = (0, feedbackPolicy_js_1.resolveFeedbackPlan)({ track: 'beginner', week: 1, base: null });
    const w12 = (0, feedbackPolicy_js_1.resolveFeedbackPlan)({ track: 'beginner', week: 12, base: null });
    strict_1.default.equal(w1.mode, 'REALTIME_FULL');
    strict_1.default.ok(w1.bandwidthCents >= w12.bandwidthCents);
    strict_1.default.ok(w12.bandwidthCents >= 18);
});
(0, node_test_1.default)('resolveFeedbackPlan: advanced reduces overlay progressively; OFF_POST only for transfer later weeks', () => {
    const w2core = (0, feedbackPolicy_js_1.resolveFeedbackPlan)({ track: 'advanced', week: 2, base: null, segment: 'core' });
    const w8core = (0, feedbackPolicy_js_1.resolveFeedbackPlan)({ track: 'advanced', week: 8, base: null, segment: 'core' });
    const w10core = (0, feedbackPolicy_js_1.resolveFeedbackPlan)({ track: 'advanced', week: 10, base: null, segment: 'core' });
    const w10transfer = (0, feedbackPolicy_js_1.resolveFeedbackPlan)({ track: 'advanced', week: 10, base: null, segment: 'transfer' });
    strict_1.default.equal(w2core.mode, 'FADED');
    strict_1.default.equal(w8core.mode, 'BANDWIDTH_ONLY');
    strict_1.default.equal(w10core.mode, 'BANDWIDTH_ONLY');
    strict_1.default.equal(w10transfer.mode, 'OFF_POST');
});
(0, node_test_1.default)('resolveFeedbackPlan: lesson base mode is respected and bandwidth is tightened by progression', () => {
    const p = (0, feedbackPolicy_js_1.resolveFeedbackPlan)({ track: 'advanced', week: 10, base: { mode: 'FADED', bandwidthCents: 40, fadeAfterSec: 1.5 } });
    strict_1.default.equal(p.mode, 'FADED');
    strict_1.default.equal(p.bandwidthCents, 28.75);
    strict_1.default.ok(Math.abs((p.fadeAfterSec ?? 0) - 1.14) < 0.001);
});
(0, node_test_1.default)('applyFeedbackPlanToDrill clones drill and applies tune window', () => {
    const d = { id: 'x', title: 't', type: 'sustain', level: 1, tuneWindowCents: 25, holdMs: 1000, countdownMs: 800 };
    const p = { mode: 'REALTIME_FULL', bandwidthCents: 50 };
    const out = (0, feedbackPolicy_js_1.applyFeedbackPlanToDrill)(d, p);
    strict_1.default.notEqual(out, d);
    strict_1.default.equal(out.tuneWindowCents, 50);
});
(0, node_test_1.default)('isTransferLikeDrillId detects phrase/melody drills', () => {
    strict_1.default.equal((0, feedbackPolicy_js_1.isTransferLikeDrillId)('song_phrase_twinkle_a'), true);
    strict_1.default.equal((0, feedbackPolicy_js_1.isTransferLikeDrillId)('melody_1'), true);
    strict_1.default.equal((0, feedbackPolicy_js_1.isTransferLikeDrillId)('sustain_a3_steady'), false);
});
