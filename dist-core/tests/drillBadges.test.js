"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const drillBadges_js_1 = require("../share/drillBadges.js");
(0, node_test_1.default)("buildDrillBadges includes PB + accuracy/stability", () => {
    const attempt = {
        id: "att1",
        createdAt: 1,
        sessionId: "s1",
        drillId: "d1",
        score: 88,
        metrics: {
            drillType: "sustain",
            avgAbsCents: 9,
            wobbleCents: 8,
            voicedRatio: 0.9,
            timeToEnterMs: 800,
        },
    };
    const b = (0, drillBadges_js_1.buildDrillBadges)({ attempt, bestScoreBefore: 80 });
    const texts = b.map((x) => x.text);
    strict_1.default.ok(texts.includes("New personal best"));
    strict_1.default.ok(texts.includes("Accuracy elite"));
    strict_1.default.ok(texts.includes("Rock solid"));
});
(0, node_test_1.default)("buildDrillBadges includes interval nailed when close", () => {
    const attempt = {
        id: "att2",
        createdAt: 1,
        sessionId: "s1",
        drillId: "d2",
        score: 75,
        metrics: {
            drillType: "interval",
            intervalErrorCents: 12,
            intervalDirectionCorrect: true,
            avgAbsCents: 16,
            wobbleCents: 14,
            voicedRatio: 0.8,
            timeToEnterMs: 1300,
        },
    };
    const b = (0, drillBadges_js_1.buildDrillBadges)({ attempt, bestScoreBefore: 80 });
    strict_1.default.ok(b.some((x) => x.text === "Interval nailed"));
});
