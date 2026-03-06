"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const render_1 = require("../render");
const JourneyHeaderModule_1 = require("@/ui/modules/journey/JourneyHeaderModule");
const ResultsScoreModule_1 = require("@/ui/modules/results/ResultsScoreModule");
const SectionHeaderModule_1 = require("@/ui/modules/shared/SectionHeaderModule");
(0, node_test_1.default)('JourneyHeaderModule renders', () => {
    const tree = (0, render_1.render)((0, jsx_runtime_1.jsx)(JourneyHeaderModule_1.JourneyHeaderModule, { tab: "map", onTab: () => { }, testID: "journey.header" }));
    strict_1.default.ok(tree.root.findByProps({ testID: 'journey.header' }));
});
(0, node_test_1.default)('ResultsScoreModule renders score block', () => {
    const tree = (0, render_1.render)((0, jsx_runtime_1.jsx)(ResultsScoreModule_1.ResultsScoreModule, { score: 82, deltaValue: "+27", milestones: { day7: "60", day30: "70" }, testID: "results.score" }));
    strict_1.default.ok(tree.root.findByProps({ testID: 'results.score' }));
});
(0, node_test_1.default)('SectionHeaderModule renders title', () => {
    const tree = (0, render_1.render)((0, jsx_runtime_1.jsx)(SectionHeaderModule_1.SectionHeaderModule, { title: "Title", actionLabel: "Act", onAction: () => { }, testID: "section" }));
    strict_1.default.ok(tree.root.findByProps({ testID: 'section' }));
});
