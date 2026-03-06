"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const hzToNote_js_1 = require("../pitch/hzToNote.js");
(0, node_test_1.default)("hzToNote 440Hz -> A4", () => {
    const n = (0, hzToNote_js_1.hzToNote)(440);
    strict_1.default.equal(n.note, "A4");
    strict_1.default.ok(Math.abs(n.cents) < 1);
});
(0, node_test_1.default)("midiToHz/hzToMidi roundtrip", () => {
    const midi = (0, hzToNote_js_1.hzToMidi)(261.625565); // C4
    strict_1.default.ok(Math.abs(midi - 60) < 0.01);
    const hz = (0, hzToNote_js_1.midiToHz)(60);
    strict_1.default.ok(Math.abs(hz - 261.625565) < 0.2);
});
