"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const render_1 = require("../render");
const PremiumRangePracticePanel_1 = require("../../onboarding/PremiumRangePracticePanel");
(0, node_test_1.default)('PremiumRangePracticePanel renders with minimal data', () => {
    const tree = (0, render_1.render)((0, jsx_runtime_1.jsx)(PremiumRangePracticePanel_1.PremiumRangePracticePanel, { likelyZone: "Alto", progress: 0.35, traceValues: [0.4, 0.5, 0.55], phraseChunks: ['ah', 'aa', 'ah'], elapsedLabel: "00:14", totalLabel: "02:45" }));
    const canvases = tree.root.findAllByType('Canvas');
    strict_1.default.ok(canvases.length >= 1);
});
