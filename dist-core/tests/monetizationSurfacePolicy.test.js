"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const surfacePolicy_1 = require("../monetization/surfacePolicy");
(0, node_test_1.default)('passive monetization is blocked on trust-critical loop surfaces', () => {
    const blocked = (0, surfacePolicy_1.listBlockedPassiveMonetizationSurfaces)();
    for (const surface of ['Welcome', 'PermissionsPrimer', 'WakeYourVoice', 'Drill', 'Playback', 'Recovery']) {
        strict_1.default.equal(blocked.includes(surface), true, `expected ${surface} to be blocked`);
        strict_1.default.equal((0, surfacePolicy_1.canShowPassiveMonetization)(surface), false, `${surface} must not host passive monetization`);
    }
});
(0, node_test_1.default)('passive monetization is allowed on session-closure surfaces', () => {
    strict_1.default.equal((0, surfacePolicy_1.canShowPassiveMonetization)('SessionSummary'), true);
    strict_1.default.equal((0, surfacePolicy_1.canShowPassiveMonetization)('DayComplete'), true);
    strict_1.default.equal((0, surfacePolicy_1.canShowPassiveMonetization)('WeeklyReport'), true);
});
