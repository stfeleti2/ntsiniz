"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const waveformMath_1 = require("../../patterns/waveformMath");
(0, node_test_1.default)('waveformMath: progressFromX respects padding', () => {
    const width = 200;
    const pad = 10;
    // left padding should map to 0
    strict_1.default.equal((0, waveformMath_1.progressFromX)(10, width, pad), 0);
    // right padding should map to 1
    strict_1.default.equal((0, waveformMath_1.progressFromX)(190, width, pad), 1);
    // center (100) should be ~0.5
    strict_1.default.ok(Math.abs((0, waveformMath_1.progressFromX)(100, width, pad) - 0.5) < 1e-6);
});
(0, node_test_1.default)('waveformMath: xFromProgress is inverse of progressFromX (within clamp)', () => {
    const width = 300;
    const pad = 12;
    for (const p of [0, 0.1, 0.5, 0.9, 1]) {
        const x = (0, waveformMath_1.xFromProgress)(p, width, pad);
        const p2 = (0, waveformMath_1.progressFromX)(x, width, pad);
        strict_1.default.ok(Math.abs(p2 - p) < 1e-6);
    }
});
