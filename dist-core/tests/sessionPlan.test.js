"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const sessionPlan_js_1 = require("../profile/sessionPlan.js");
const pack = {
    packId: "t",
    language: "en",
    drills: [
        { id: "m1", title: "Match", type: "match_note", level: 1, tuneWindowCents: 25, holdMs: 900, countdownMs: 800, target: { note: "A4" } },
        { id: "s1", title: "Sustain", type: "sustain", level: 2, tuneWindowCents: 25, holdMs: 900, countdownMs: 800, target: { note: "A4" } },
        { id: "sl1", title: "Slide", type: "slide", level: 2, tuneWindowCents: 25, holdMs: 900, countdownMs: 800, from: { note: "A4" }, to: { note: "B4" } },
        { id: "i1", title: "Interval", type: "interval", level: 2, tuneWindowCents: 25, holdMs: 900, countdownMs: 800, target: { note: "A4" }, intervalSemitones: 5 },
        { id: "me1", title: "Melody", type: "melody_echo", level: 2, tuneWindowCents: 25, holdMs: 900, countdownMs: 800, melody: [{ note: "A4" }] }
    ]
};
(0, node_test_1.default)("createSessionPlan makes 3-drill plan", () => {
    const p = (0, sessionPlan_js_1.createSessionPlan)("sess1", pack, "m1");
    strict_1.default.equal(p.drillIds.length, 3);
    strict_1.default.equal(p.drillIds[0], "m1");
    strict_1.default.equal((0, sessionPlan_js_1.getPlan)("sess1")?.drillIds.length, 3);
});
(0, node_test_1.default)("advancePlan increments index", () => {
    (0, sessionPlan_js_1.createSessionPlan)("sess2", pack, "m1");
    const p1 = (0, sessionPlan_js_1.getPlan)("sess2");
    strict_1.default.equal(p1.index, 0);
    (0, sessionPlan_js_1.advancePlan)("sess2");
    const p2 = (0, sessionPlan_js_1.getPlan)("sess2");
    strict_1.default.equal(p2.index, 1);
});
(0, node_test_1.default)("markFail increments fail streak", () => {
    (0, sessionPlan_js_1.createSessionPlan)("sess3", pack, "m1");
    (0, sessionPlan_js_1.markFail)("sess3", "m1");
    (0, sessionPlan_js_1.markFail)("sess3", "m1");
    strict_1.default.equal((0, sessionPlan_js_1.getPlan)("sess3").failStreakByDrill["m1"], 2);
});
