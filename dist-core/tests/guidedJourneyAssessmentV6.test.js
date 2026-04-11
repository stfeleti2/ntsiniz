"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = require("node:fs");
const rawProgram = JSON.parse((0, node_fs_1.readFileSync)('src/content/guided_journey/production.en.json', 'utf8'));
(0, node_test_1.default)('V6 stage assessments load the multi-gate benchmark structure', () => {
    const assessment = rawProgram.assessments.find((item) => item.stage_id === 'S1');
    strict_1.default.ok(assessment);
    strict_1.default.equal(assessment.type, 'multi_gate_benchmark_v6');
    strict_1.default.ok(assessment.sections.length >= 6);
    strict_1.default.ok(assessment.promotion_rules.some((rule) => rule.includes('technical + transfer + health')));
    strict_1.default.ok(assessment.benchmark_drill_ids.length >= 3);
});
(0, node_test_1.default)('V6 rubric dimensions are available for assessment summaries', () => {
    const names = rawProgram.assessment_rubric_dimensions.map((item) => item.name);
    strict_1.default.ok(names.includes('technique_accuracy'));
    strict_1.default.ok(names.includes('efficiency_health'));
    strict_1.default.ok(names.includes('transfer_application'));
});
