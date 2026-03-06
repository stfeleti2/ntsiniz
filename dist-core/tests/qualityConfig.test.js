"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const qualityHeuristics_js_1 = require("../perf/qualityHeuristics.js");
(0, node_test_1.default)('quality config includes audioAnalysisStride per mode', () => {
    const hi = (0, qualityHeuristics_js_1.buildQualityConfig)('HIGH', 'MID');
    const bal = (0, qualityHeuristics_js_1.buildQualityConfig)('BALANCED', 'MID');
    const lite = (0, qualityHeuristics_js_1.buildQualityConfig)('LITE', 'LOW');
    strict_1.default.equal(hi.audioAnalysisStride, 1);
    strict_1.default.equal(bal.audioAnalysisStride, 2);
    strict_1.default.equal(lite.audioAnalysisStride, 3);
    strict_1.default.ok(hi.audioAnalysisStride <= bal.audioAnalysisStride);
    strict_1.default.ok(bal.audioAnalysisStride <= lite.audioAnalysisStride);
});
