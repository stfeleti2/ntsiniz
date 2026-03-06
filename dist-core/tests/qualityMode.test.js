"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const qualityHeuristics_js_1 = require("../perf/qualityHeuristics.js");
(0, node_test_1.default)('quality: device tier classification is stable', () => {
    const low = (0, qualityHeuristics_js_1.classifyDeviceTier)({ platform: 'android', widthPx: 360, heightPx: 740, pixelRatio: 2 }); // ~4.2M
    const mid = (0, qualityHeuristics_js_1.classifyDeviceTier)({ platform: 'android', widthPx: 411, heightPx: 891, pixelRatio: 2.5 }); // ~9.1M
    const high = (0, qualityHeuristics_js_1.classifyDeviceTier)({ platform: 'ios', widthPx: 430, heightPx: 932, pixelRatio: 3 }); // ~36M
    strict_1.default.equal(low, 'LOW');
    strict_1.default.equal(mid, 'MID');
    strict_1.default.equal(high, 'HIGH');
});
(0, node_test_1.default)('quality: initial mode per tier', () => {
    strict_1.default.equal((0, qualityHeuristics_js_1.initialQualityForTier)('LOW'), 'LITE');
    strict_1.default.equal((0, qualityHeuristics_js_1.initialQualityForTier)('MID'), 'BALANCED');
    strict_1.default.equal((0, qualityHeuristics_js_1.initialQualityForTier)('HIGH'), 'HIGH');
});
(0, node_test_1.default)('quality: degrade/upgrade decisions', () => {
    strict_1.default.equal((0, qualityHeuristics_js_1.degradeMode)('HIGH'), 'BALANCED');
    strict_1.default.equal((0, qualityHeuristics_js_1.degradeMode)('BALANCED'), 'LITE');
    strict_1.default.equal((0, qualityHeuristics_js_1.degradeMode)('LITE'), 'LITE');
    strict_1.default.equal((0, qualityHeuristics_js_1.upgradeMode)('LITE', 'BALANCED'), 'BALANCED');
    strict_1.default.equal((0, qualityHeuristics_js_1.upgradeMode)('BALANCED', 'BALANCED'), 'BALANCED');
    strict_1.default.equal((0, qualityHeuristics_js_1.upgradeMode)('BALANCED', 'HIGH'), 'HIGH');
});
(0, node_test_1.default)('quality: thresholds do not flap instantly', () => {
    // High mode degrades at p95 >= 160.
    strict_1.default.equal((0, qualityHeuristics_js_1.shouldDegrade)({ p95StallMs: 159, worstStallMs: 0 }, 'HIGH'), false);
    strict_1.default.equal((0, qualityHeuristics_js_1.shouldDegrade)({ p95StallMs: 160, worstStallMs: 0 }, 'HIGH'), true);
    // Lite mode should only upgrade when p95 is reasonably low.
    strict_1.default.equal((0, qualityHeuristics_js_1.shouldUpgrade)({ p95StallMs: 260, worstStallMs: 0 }, 'LITE'), false);
    strict_1.default.equal((0, qualityHeuristics_js_1.shouldUpgrade)({ p95StallMs: 200, worstStallMs: 0 }, 'LITE'), true);
});
(0, node_test_1.default)('quality: config budgets differ by mode', () => {
    const hi = (0, qualityHeuristics_js_1.buildQualityConfig)('HIGH', 'HIGH');
    const lite = (0, qualityHeuristics_js_1.buildQualityConfig)('LITE', 'LOW');
    strict_1.default.ok(hi.waveformBars > lite.waveformBars);
    strict_1.default.ok(hi.shadowScale > lite.shadowScale);
});
