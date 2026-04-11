"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const yin_1 = require("../pitch/yin");
function sine(freq, sampleRate, n) {
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++)
        out[i] = Math.sin((2 * Math.PI * freq * i) / sampleRate);
    return out;
}
function addNoise(x, amp = 0.02) {
    const out = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++)
        out[i] = x[i] + (Math.random() * 2 - 1) * amp;
    return out;
}
(0, node_test_1.default)("yinDetect 220Hz", () => {
    const sr = 16000;
    const x = addNoise(sine(220, sr, 2048), 0.01);
    const r = (0, yin_1.yinDetect)(x, sr);
    strict_1.default.ok(r.freqHz != null);
    strict_1.default.ok(Math.abs(r.freqHz - 220) < 3);
    strict_1.default.ok(r.confidence > 0.6);
});
(0, node_test_1.default)("yinDetect 440Hz", () => {
    const sr = 16000;
    const x = addNoise(sine(440, sr, 2048), 0.01);
    const r = (0, yin_1.yinDetect)(x, sr);
    strict_1.default.ok(r.freqHz != null);
    strict_1.default.ok(Math.abs(r.freqHz - 440) < 5);
    strict_1.default.ok(r.confidence > 0.6);
});
