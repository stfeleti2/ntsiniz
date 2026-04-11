"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const voiceDsp_1 = require("../audio/dsp/voiceDsp");
(0, node_test_1.default)('voice DSP estimates healthy SNR and VAD for steady voiced frames', async () => {
    const dsp = (0, voiceDsp_1.createVoiceDspSession)({ sampleRate: 48000, suppressionMode: 'conservativeAdaptive' });
    let ts = 1_000;
    for (let i = 0; i < 50; i += 1) {
        dsp.pushFrame({
            sampleRate: 48000,
            timestampMs: ts,
            samples: constantFrame(960, 0.002),
            routeFingerprint: 'built_in|mic',
        });
        ts += 20;
    }
    let last = dsp.pushFrame({
        sampleRate: 48000,
        timestampMs: ts,
        samples: sineFrame(960, 220, 48000, 0.2),
        routeFingerprint: 'built_in|mic',
    });
    ts += 20;
    for (let i = 0; i < 70; i += 1) {
        last = dsp.pushFrame({
            sampleRate: 48000,
            timestampMs: ts,
            samples: sineFrame(960, 220, 48000, 0.2),
            routeFingerprint: 'built_in|mic',
        });
        ts += 20;
    }
    const summary = dsp.summary();
    strict_1.default.ok(summary.avgSnrDb > 3);
    strict_1.default.ok(summary.avgVadProb > 0.35);
    strict_1.default.ok(last.voicedRatio > 0.2);
    strict_1.default.ok(last.signalQuality === 'good' || last.signalQuality === 'excellent');
    await dsp.close();
});
(0, node_test_1.default)('voice DSP marks clipping and route changes deterministically', async () => {
    const dsp = (0, voiceDsp_1.createVoiceDspSession)({ sampleRate: 48000, suppressionMode: 'conservativeAdaptive' });
    let ts = 2_000;
    const clipped = dsp.pushFrame({
        sampleRate: 48000,
        timestampMs: ts,
        samples: constantFrame(960, 1),
        routeFingerprint: 'built_in|mic',
    });
    ts += 20;
    strict_1.default.equal(clipped.clipping, true);
    const changed = dsp.pushFrame({
        sampleRate: 48000,
        timestampMs: ts,
        samples: constantFrame(960, 0.005),
        routeFingerprint: 'bluetooth|mic',
    });
    strict_1.default.equal(changed.routeHealth, 'changed');
    await dsp.close();
});
function constantFrame(n, value) {
    const out = new Float32Array(n);
    out.fill(value);
    return out;
}
function sineFrame(n, freq, sampleRate, amp) {
    const out = new Float32Array(n);
    for (let i = 0; i < n; i += 1) {
        out[i] = Math.sin((2 * Math.PI * freq * i) / sampleRate) * amp;
    }
    return out;
}
