"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = require("node:fs");
const rawProgram = JSON.parse((0, node_fs_1.readFileSync)('src/content/guided_journey/production.en.json', 'utf8'));
(0, node_test_1.default)('V6 remediation bundles map diagnosis tags to real bundle IDs', () => {
    const bundle = rawProgram.remediation_rules.remediation_bundles.find((item) => item.triggers.includes('always_flat'));
    strict_1.default.ok(bundle);
    strict_1.default.equal(bundle.id, 'RB2');
    strict_1.default.ok(bundle.lesson_pattern.some((item) => item.includes('pitch_slide')));
});
(0, node_test_1.default)('V6 remediation profiles expose coach-tip templates', () => {
    const coachTip = rawProgram.remediation_rules.diagnosis_profiles.find((item) => item.tag === 'wrong_direction_interval')?.coach_tip_template;
    strict_1.default.ok(coachTip);
    strict_1.default.ok(coachTip?.includes('up or down'));
});
