"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = require("node:fs");
const v6Selectors_1 = require("../guidedJourney/v6Selectors");
const rawProgram = JSON.parse((0, node_fs_1.readFileSync)('src/content/guided_journey/production.en.json', 'utf8'));
const program = {
    lessons: rawProgram.lessons.map((lesson) => ({
        id: lesson.id,
        stageId: lesson.stage,
        drillIds: lesson.drill_ids,
        completionCriteria: lesson.completion_criteria ?? [],
    })),
    drillsById: Object.fromEntries(rawProgram.drills.map((drill) => [
        drill.id,
        {
            id: drill.id,
            assessmentEvidence: {
                transfer: !!drill.assessment_evidence?.transfer,
            },
        },
    ])),
    progressionRules: {
        stagePassThresholds: rawProgram.progression_rules.stage_pass_thresholds,
    },
    remediationRules: {
        remediationBundles: rawProgram.remediation_rules.remediation_bundles.map((bundle) => ({
            id: bundle.id,
            name: bundle.name,
            triggers: bundle.triggers,
            lessonPattern: bundle.lesson_pattern,
        })),
    },
};
(0, node_test_1.default)('V6 lesson evaluation blocks completion until transfer evidence passes', () => {
    const lesson = program.lessons.find((item) => item.drillIds.some((id) => program.drillsById[id]?.assessmentEvidence?.transfer));
    strict_1.default.ok(lesson);
    const transferDrill = lesson.drillIds.map((id) => program.drillsById[id]).find((drill) => drill?.assessmentEvidence?.transfer);
    const nonTransfer = lesson.drillIds.map((id) => program.drillsById[id]).filter(Boolean).slice(0, 3);
    strict_1.default.ok(transferDrill);
    strict_1.default.ok(nonTransfer.length >= 3);
    const blocked = (0, v6Selectors_1.evaluateGuidedLessonSession)(program, lesson, nonTransfer.map((drill, index) => ({
        id: `att_block_${index}`,
        createdAt: Date.now() + index,
        sessionId: 'sess_block',
        drillId: `host_${index}`,
        score: 84,
        metrics: {
            guidedJourney: {
                lessonId: lesson.id,
                packDrillId: drill.id,
                passed: true,
                rubricDimensions: {
                    technique_accuracy: 84,
                    stability_repeatability: 80,
                },
            },
        },
    })), []);
    strict_1.default.equal(blocked.completed, false);
    strict_1.default.equal(blocked.transferPassed, false);
    strict_1.default.equal(blocked.gateStatus.technical, true);
    const passing = (0, v6Selectors_1.evaluateGuidedLessonSession)(program, lesson, [transferDrill, ...nonTransfer.slice(0, 2)].map((drill, index) => ({
        id: `att_pass_${index}`,
        createdAt: Date.now() + index,
        sessionId: 'sess_pass',
        drillId: `host_pass_${index}`,
        score: 86,
        metrics: {
            guidedJourney: {
                lessonId: lesson.id,
                packDrillId: drill.id,
                passed: true,
                rubricDimensions: {
                    technique_accuracy: 86,
                    transfer_application: drill.id === transferDrill.id ? 84 : undefined,
                    stability_repeatability: 83,
                },
            },
        },
    })), []);
    strict_1.default.equal(passing.completed, true);
    strict_1.default.equal(passing.transferPassed, true);
    strict_1.default.equal(passing.passedDrillCount, 3);
    strict_1.default.equal(passing.gateStatus.technical, true);
});
(0, node_test_1.default)('V6 lesson technical gate stays blocked until three drills pass', () => {
    const lesson = program.lessons[0];
    strict_1.default.ok(lesson);
    const drills = lesson.drillIds.map((id) => program.drillsById[id]).filter(Boolean).slice(0, 2);
    strict_1.default.equal(drills.length, 2);
    const result = (0, v6Selectors_1.evaluateGuidedLessonSession)(program, lesson, drills.map((drill, index) => ({
        id: `att_two_${index}`,
        createdAt: Date.now() + index,
        sessionId: 'sess_two',
        drillId: `host_two_${index}`,
        score: 88,
        metrics: {
            guidedJourney: {
                lessonId: lesson.id,
                packDrillId: drill.id,
                passed: true,
                rubricDimensions: {
                    technique_accuracy: 88,
                    stability_repeatability: 84,
                },
            },
        },
    })), []);
    strict_1.default.equal(result.passedDrillCount, 2);
    strict_1.default.equal(result.completed, false);
    strict_1.default.equal(result.gateStatus.technical, false);
});
