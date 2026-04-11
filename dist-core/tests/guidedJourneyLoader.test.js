"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = require("node:fs");
const rawProgram = JSON.parse((0, node_fs_1.readFileSync)('src/content/guided_journey/production.en.json', 'utf8'));
(0, node_test_1.default)('guided journey production pack has the expected chapter structure', () => {
    strict_1.default.equal(rawProgram.routes.length, 5);
    strict_1.default.equal(rawProgram.stages.length, 5);
    strict_1.default.equal(rawProgram.lessons.length, 30);
    strict_1.default.ok(rawProgram.drills.length >= 150);
    strict_1.default.equal(rawProgram.routes.find((route) => route.id === 'R5')?.primary_stage_ids?.[0], 'S2');
    strict_1.default.ok(Array.isArray(rawProgram.load_tiers?.tiers));
    strict_1.default.ok(Array.isArray(rawProgram.assessment_rubric_dimensions));
    strict_1.default.ok(Array.isArray(rawProgram.pressure_ladders?.S1));
    strict_1.default.ok(Array.isArray(rawProgram.remediation_rules?.remediation_bundles));
});
(0, node_test_1.default)('guided journey lessons carry route-specific drill slices', () => {
    const lesson = rawProgram.lessons.find((item) => item.id === 'S1_L01');
    strict_1.default.ok(lesson);
    const drills = rawProgram.drills.filter((drill) => lesson.drill_ids.includes(drill.id));
    const routeIds = Array.from(new Set(drills.map((drill) => drill.route_id))).sort();
    strict_1.default.deepEqual(routeIds, ['R1']);
});
(0, node_test_1.default)('guided journey lessons and drills expose V6 metadata fields', () => {
    const lesson = rawProgram.lessons.find((item) => item.id === 'S1_L01');
    const drill = rawProgram.drills.find((item) => item.id === 'D001');
    const assessment = rawProgram.assessments.find((item) => item.id === 'A_S1');
    strict_1.default.ok(Array.isArray(lesson.lesson_outcomes));
    strict_1.default.equal(typeof lesson.mastery_gate?.technical, 'string');
    strict_1.default.equal(typeof lesson.load_tier_target, 'string');
    strict_1.default.equal(typeof drill.load_tier, 'string');
    strict_1.default.equal(typeof drill.learning_phase, 'string');
    strict_1.default.equal(typeof drill.pressure_ladder_step, 'string');
    strict_1.default.ok(Array.isArray(assessment.sections));
    strict_1.default.ok(Array.isArray(assessment.promotion_rules));
});
