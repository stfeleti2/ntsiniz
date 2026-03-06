"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const pcm_js_1 = require("../audio/pcm.js");
function b64FromI16(vals) {
    const buf = Buffer.alloc(vals.length * 2);
    for (let i = 0; i < vals.length; i++)
        buf.writeInt16LE(vals[i], i * 2);
    return buf.toString('base64');
}
(0, node_test_1.default)('pcmBase64ToFloat32 decodes and can reuse output buffer', () => {
    const b64 = b64FromI16([0, 16384, -16384, 32767, -32768]);
    const out1 = (0, pcm_js_1.pcmBase64ToFloat32)(b64);
    strict_1.default.equal(out1.length, 5);
    strict_1.default.equal(out1[0], 0);
    strict_1.default.ok(Math.abs(out1[1] - 0.5) < 1e-6);
    strict_1.default.ok(Math.abs(out1[2] + 0.5) < 1e-6);
    const out2 = (0, pcm_js_1.pcmBase64ToFloat32)(b64, out1);
    // Same reference reused
    strict_1.default.equal(out2, out1);
    strict_1.default.ok(Math.abs(out2[3] - (32767 / 32768)) < 1e-6);
    strict_1.default.equal(out2[4], -1);
});
