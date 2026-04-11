"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const scenarios_1 = require("@/app/dev/sandbox/scenarios");
const previews_1 = require("@/screens/previews");
(0, node_test_1.default)("sandbox flow registry exposes required scenarios", () => {
    const ids = Object.keys(scenarios_1.flowScenarios).sort();
    strict_1.default.deepEqual(ids, ["onboarding", "signin", "singing-start"]);
    for (const id of ids) {
        const scenario = scenarios_1.flowScenarios[id];
        strict_1.default.ok(scenario.title.length > 0, `scenario ${id} missing title`);
        strict_1.default.ok(scenario.steps.length > 0, `scenario ${id} missing steps`);
    }
});
(0, node_test_1.default)("viewport presets include phone and tablet breakpoints", () => {
    strict_1.default.equal(scenarios_1.viewportWidths["phone-sm"] > 0, true);
    strict_1.default.equal(scenarios_1.viewportWidths["phone-lg"] > scenarios_1.viewportWidths["phone-sm"], true);
    strict_1.default.equal(scenarios_1.viewportWidths.tablet > scenarios_1.viewportWidths["phone-lg"], true);
});
(0, node_test_1.default)("screen preview registry covers required flow previews", () => {
    const ids = previews_1.orderedScreenPreviews.map((entry) => entry.id).sort();
    strict_1.default.deepEqual(ids, ["drill", "mic-permission", "playback", "range-finder", "session-summary", "singing-level", "welcome"]);
});
