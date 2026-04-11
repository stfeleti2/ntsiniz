"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const singingLevel_1 = require("../guidedJourney/singingLevel");
(0, node_test_1.default)('singing level maps to gentle high-guidance starter profile', () => {
    const profile = (0, singingLevel_1.profileForSingingLevel)('justStarting');
    strict_1.default.equal(profile.coachingMode, 'starter');
    strict_1.default.equal(profile.helperDensity, 'high');
    strict_1.default.equal(profile.routeHint, 'R1');
});
(0, node_test_1.default)('professional level maps to performer profile with lighter helper density', () => {
    const profile = (0, singingLevel_1.profileForSingingLevel)('professionalCoach');
    strict_1.default.equal(profile.coachingMode, 'performerCoach');
    strict_1.default.equal(profile.helperDensity, 'light');
    strict_1.default.equal(profile.routeHint, 'R5');
});
