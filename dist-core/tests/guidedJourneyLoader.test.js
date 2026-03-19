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
});
(0, node_test_1.default)('guided journey lessons carry route-specific drill slices', () => {
    const lesson = rawProgram.lessons.find((item) => item.id === 'S1_L01');
    strict_1.default.ok(lesson);
    const drills = rawProgram.drills.filter((drill) => lesson.drill_ids.includes(drill.id));
    const routeIds = Array.from(new Set(drills.map((drill) => drill.route_id))).sort();
    strict_1.default.deepEqual(routeIds, ['R1', 'R3', 'R4']);
});
