"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const permissionGate_js_1 = require("../audio/permissionGate.js");
const drillExecutor_js_1 = require("../drills/drillExecutor.js");
function makeSineFrame(freqHz, sampleRate, durationMs, phase, amp = 0.65) {
    const n = Math.round((sampleRate * durationMs) / 1000);
    const out = new Float32Array(n);
    const w = (2 * Math.PI * freqHz) / sampleRate;
    for (let i = 0; i < n; i++)
        out[i] = Math.sin((phase + i) * w) * amp;
    return { samples: out, phase: phase + n };
}
const baseSettings = {
    language: "en",
    voiceCoaching: false,
    coachPlayback: true,
    listenThenSing: true,
    soundCues: false,
    sensitivity: 2,
    noiseGateRms: 0,
    hasCalibrated: true,
};
const baseProfile = {
    id: "default",
    updatedAt: 0,
    biasCents: 0,
    driftCentsPerSec: 0,
    wobbleCents: 0,
    overshootRate: 0,
    voicedRatio: 0.9,
    confidence: 0.8,
};
(0, node_test_1.default)("runDrillWithDrivers: respects Listen-Then-Sing ordering (reference playback before mic capture)", async () => {
    (0, permissionGate_js_1.resetPermissionGate)();
    let now = 0;
    const realNow = Date.now;
    Date.now = () => now;
    const calls = [];
    let refDone = false;
    const drill = {
        id: "d_test",
        title: "A4 Lock",
        type: "match_note",
        level: 1,
        tuneWindowCents: 35,
        holdMs: 80,
        countdownMs: 0,
        target: { note: "A4" },
    };
    try {
        const res = await (0, drillExecutor_js_1.runDrillWithDrivers)({ drill, settings: baseSettings, profile: baseProfile }, {
            ensureMicPermission: async () => {
                calls.push("perm");
                return true;
            },
            playReferenceForDrill: async () => {
                calls.push("ref:start");
                await Promise.resolve();
                refDone = true;
                calls.push("ref:end");
            },
            stopTone: async () => {
                calls.push("tone:stop");
            },
            startMic: async (_cfg, onFrame) => {
                calls.push(refDone ? "mic:after_ref" : "mic:before_ref");
                // feed a few frames of A4 to finish quickly
                const sr = 44100;
                let phase = 0;
                for (let i = 0; i < 40; i++) {
                    const f = makeSineFrame(440, sr, 20, phase);
                    phase = f.phase;
                    now += 20;
                    onFrame({ samples: f.samples });
                }
                return {
                    stop: async () => {
                        calls.push("mic:stop");
                    },
                };
            },
            clock: {
                now: () => now,
                setTimeout: (fn) => setTimeout(fn, 10),
                clearTimeout: (id) => clearTimeout(id),
            },
        });
        strict_1.default.equal(calls.includes("mic:before_ref"), false);
        strict_1.default.equal(calls.includes("mic:after_ref"), true);
        strict_1.default.ok(Number.isFinite(res.score), `expected finite score, got ${res.score}`);
    }
    finally {
        ;
        Date.now = realNow;
    }
});
(0, node_test_1.default)("runDrillWithDrivers: mic permission check is gated (prompt once across runs)", async () => {
    (0, permissionGate_js_1.resetPermissionGate)();
    let now = 0;
    const realNow = Date.now;
    Date.now = () => now;
    let permCalls = 0;
    const drill = {
        id: "d_test2",
        title: "Quick A4",
        type: "match_note",
        level: 1,
        tuneWindowCents: 40,
        holdMs: 60,
        countdownMs: 0,
        target: { note: "A4" },
    };
    const drivers = {
        ensureMicPermission: async () => {
            permCalls += 1;
            return true;
        },
        startMic: async (_cfg, onFrame) => {
            const sr = 44100;
            let phase = 0;
            for (let i = 0; i < 10; i++) {
                const f = makeSineFrame(440, sr, 20, phase);
                phase = f.phase;
                now += 20;
                onFrame({ samples: f.samples });
            }
            return { stop: async () => { } };
        },
        clock: {
            now: () => now,
            setTimeout: (fn) => setTimeout(fn, 10),
            clearTimeout: (id) => clearTimeout(id),
        },
    };
    try {
        await (0, drillExecutor_js_1.runDrillWithDrivers)({ drill, settings: baseSettings, profile: baseProfile }, drivers);
        await (0, drillExecutor_js_1.runDrillWithDrivers)({ drill, settings: baseSettings, profile: baseProfile }, drivers);
        strict_1.default.equal(permCalls, 1);
    }
    finally {
        ;
        Date.now = realNow;
    }
});
(0, node_test_1.default)("runDrillWithDrivers: repeatability (same audio frames -> stable score)", async () => {
    (0, permissionGate_js_1.resetPermissionGate)();
    let now = 0;
    const realNow = Date.now;
    Date.now = () => now;
    const drill = {
        id: "d_repeat",
        title: "A4 Repeat",
        type: "match_note",
        level: 1,
        tuneWindowCents: 35,
        holdMs: 120,
        countdownMs: 0,
        target: { note: "A4" },
    };
    // Generate a deterministic set of frames once and replay them.
    const sr = 44100;
    const frames = [];
    let phase = 0;
    for (let i = 0; i < 18; i++) {
        const f = makeSineFrame(440, sr, 20, phase);
        phase = f.phase;
        frames.push(f.samples);
    }
    const runOnce = async () => {
        now = 0;
        return (0, drillExecutor_js_1.runDrillWithDrivers)({ drill, settings: baseSettings, profile: baseProfile }, {
            ensureMicPermission: async () => true,
            startMic: async (_cfg, onFrame) => {
                for (const s of frames) {
                    now += 20;
                    onFrame({ samples: s });
                }
                return { stop: async () => { } };
            },
            clock: {
                now: () => now,
                setTimeout: (fn) => setTimeout(fn, 10),
                clearTimeout: (id) => clearTimeout(id),
            },
        });
    };
    try {
        const a = await runOnce();
        const b = await runOnce();
        // We expect stability: allow tiny variance in case of float rounding.
        const delta = Math.abs(a.score - b.score);
        strict_1.default.ok(delta <= 2, `expected score delta <= 2, got ${delta} (a=${a.score}, b=${b.score})`);
    }
    finally {
        ;
        Date.now = realNow;
    }
});
