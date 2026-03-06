"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrillAbortError = void 0;
exports.runDrillWithDrivers = runDrillWithDrivers;
const pitchTruth_1 = require("../pitch/pitchTruth");
const runnerMachine_1 = require("./runnerMachine");
const tips_1 = require("../profile/tips");
const permissionGate_1 = require("../audio/permissionGate");
const frameBus_1 = require("../audio/frameBus");
const perfMonitor_1 = require("../perf/perfMonitor");
const audioFormatProbe_1 = require("../audio/audioFormatProbe");
const logger_1 = require("../observability/logger");
class DrillAbortError extends Error {
    reason;
    constructor(reason = 'drill_aborted') {
        super(reason);
        this.name = 'DrillAbortError';
        this.reason = reason;
    }
}
exports.DrillAbortError = DrillAbortError;
/**
 * Runs a drill end-to-end with injected platform drivers.
 *
 * Why this exists:
 * - Keep the sequencing logic testable (permissions → optional playback → mic capture → scoring)
 * - Let E2E automation enable a simulated mic source / simulated share without changing core.
 */
async function runDrillWithDrivers(ctx, drivers, opts) {
    const clock = drivers.clock ?? {
        now: () => Date.now(),
        setTimeout: (fn, ms) => setTimeout(fn, ms),
        clearTimeout: (id) => clearTimeout(id),
    };
    const { drill, settings, profile } = ctx;
    const signal = opts?.signal;
    const ok = await (0, permissionGate_1.ensurePermissionOnce)(drivers.ensureMicPermission);
    if (!ok) {
        return {
            score: 0,
            metrics: { drillType: drill.type, error: "mic_permission_denied" },
            tip: "Enable microphone permission to start drills.",
            summary: "Microphone permission is required for pitch training.",
        };
    }
    // Playback controls: only if user wants playback + wants listen-then-sing.
    if (settings.coachPlayback && settings.listenThenSing && drivers.playReferenceForDrill) {
        try {
            await drivers.playReferenceForDrill(drill);
        }
        catch {
            // Keep going even if playback fails.
        }
        finally {
            await drivers.stopTone?.().catch((e) => logger_1.logger.warn('stopTone failed', e));
        }
    }
    const sensitivity = Math.max(0.5, Math.min(2, settings.sensitivity ?? 1));
    const noiseGate = Math.max(0, Math.min(0.2, (settings.noiseGateRms ?? 0.02) / sensitivity));
    // Prefer device-native sample rate (often 48kHz) but keep analysis cadence independent.
    // We probe best-effort (works even without native module) and allow the platform
    // driver to negotiate/fallback (e.g. if requested rate unsupported).
    const probed = await (0, audioFormatProbe_1.probeAudioInputFormat)().catch(() => ({ sampleRate: 44100, channels: 1, bufferDurationMs: 10 }));
    const micCfg = await drivers
        .negotiateMicConfig?.({ sampleRate: probed.sampleRate, frameDurationMs: 20 })
        .catch(() => null);
    const sampleRate = micCfg?.sampleRate ?? probed.sampleRate ?? 44100;
    const frameMs = micCfg?.frameDurationMs ?? 20;
    const pitch = new pitchTruth_1.PitchTruth({
        sampleRate,
        noiseGateRms: noiseGate,
        minConfidence: 0.55 / sensitivity,
        noteChangeConfirmFrames: 2,
    });
    // Analyze every Nth frame to reduce CPU without reducing input fidelity.
    // We still ingest every frame so the analysis window is correct.
    let analysisStride = Math.max(1, (drivers.getAudioAnalysisStride?.() ?? 2));
    let frameCounter = 0;
    let strideRefreshCounter = 0;
    const runner = new runnerMachine_1.DrillRunner(drill);
    runner.start();
    let mic = null;
    const steps = guessSteps(drill);
    const maxMs = Math.max(12_000, drill.countdownMs + (drill.holdMs + 4_500) * steps + 2_000);
    let done = false;
    // Keep the native frame callback fast (avoid blocking audio capture).
    const bus = new frameBus_1.FrameBus({ maxQueue: 12, maxPerTick: 3 });
    let statsTick = 0;
    let finish = () => { };
    let fail = () => { };
    const resultPromise = new Promise((resolve, reject) => {
        finish = (r) => {
            if (done)
                return;
            done = true;
            resolve(r);
        };
        fail = (e) => {
            if (done)
                return;
            done = true;
            reject(e);
        };
    });
    const timeoutId = clock.setTimeout(() => {
        finish({
            score: 0,
            metrics: { drillType: drill.type, error: "timeout", steps },
        });
    }, maxMs);
    const onAbort = () => {
        fail(new DrillAbortError());
    };
    if (signal) {
        if (signal.aborted)
            onAbort();
        else
            signal.addEventListener?.('abort', onAbort);
    }
    try {
        mic = await drivers.startMic({ sampleRate, frameDurationMs: frameMs }, (ev) => {
            if (done)
                return;
            // Push to bus; heavy work happens in scheduled drain loop.
            bus.push(ev, (frame) => {
                if (done)
                    return;
                let reading = null;
                if (frame.samples) {
                    pitch.ingestSamples(frame.samples);
                    frameCounter += 1;
                    strideRefreshCounter += 1;
                    if (strideRefreshCounter >= 50) {
                        strideRefreshCounter = 0;
                        analysisStride = Math.max(1, (drivers.getAudioAnalysisStride?.() ?? analysisStride));
                    }
                    if (frameCounter % analysisStride === 0)
                        reading = pitch.analyze();
                    else
                        reading = pitch.getLastStableReading();
                }
                else if (frame.pcmBase64) {
                    // Base64 path is primarily used by platform drivers; keep correctness over micro-optimizations.
                    reading = pitch.pushPcmBase64(frame.pcmBase64);
                }
                const frameRms = pitch.getLastFrameRms();
                const framePeak = pitch.getLastFramePeak();
                const clipped = pitch.getLastFrameClipped();
                // UI telemetry (Ghost Guide): emit before ticking so UI sees the current target.
                try {
                    const diag = !reading
                        ? {
                            reason: frameRms != null && frameRms < noiseGate * 1.2
                                ? 'too_quiet'
                                : 'low_confidence',
                            frameRms,
                            framePeak,
                            clipped,
                        }
                        : { reason: 'ok', frameRms, framePeak, clipped };
                    drivers.onGhostFrame?.({ t: Date.now(), reading, ghost: runner.getGhostState(), diag });
                }
                catch {
                    // ignore
                }
                const out = runner.tick(reading);
                if (out)
                    finish(out);
            });
            // FrameBus pressure feeds AUTO quality adaptation (and local diagnostics).
            // Keep this cheap: sample every ~10 frames.
            statsTick = (statsTick + 1) % 10;
            if (statsTick === 0) {
                const st = bus.getStats();
                (0, perfMonitor_1.reportFrameBusStats)({ queue: st.queue, dropped: st.dropped });
            }
        }, (msg) => fail(new Error(msg)));
        const result = await resultPromise;
        if (settings.soundCues && drivers.playSfx) {
            try {
                if (result.score >= 85)
                    await drivers.playSfx("win");
                else if (result.score >= 70)
                    await drivers.playSfx("streak");
                else if (result.score >= 60)
                    await drivers.playSfx("pb");
            }
            catch {
                // ignore
            }
        }
        const profileNext = applyProfileDelta(profile, result.metrics);
        const tip = (0, tips_1.generateTip)(profileNext);
        const summary = buildSummary(drill, result.metrics, result.score);
        return {
            score: result.score,
            metrics: result.metrics,
            tip,
            summary,
            profileDelta: profileNext,
        };
    }
    finally {
        if (signal)
            signal.removeEventListener?.('abort', onAbort);
        clock.clearTimeout(timeoutId);
        bus.stop();
        await mic?.stop().catch((e) => logger_1.logger.warn('mic stop failed', e));
        await drivers.stopTone?.().catch((e) => logger_1.logger.warn('stopTone failed', e));
        await drivers.stopSfx?.().catch((e) => logger_1.logger.warn('stopSfx failed', e));
    }
}
function guessSteps(drill) {
    if (drill.type === "melody_echo")
        return drill.melody?.length ?? 1;
    if (drill.type === "interval")
        return 2;
    if (drill.type === "slide")
        return 2;
    return 1;
}
function applyProfileDelta(prev, metrics) {
    const lerp = (a, b, t) => a + (b - a) * t;
    const t = 0.22;
    const bias = typeof metrics?.meanCents === "number" ? metrics.meanCents : 0;
    const drift = typeof metrics?.driftCentsPerSec === "number" ? metrics.driftCentsPerSec : 0;
    const wobble = typeof metrics?.wobbleCents === "number" ? metrics.wobbleCents : 0;
    const over = typeof metrics?.overshootRate === "number" ? metrics.overshootRate : 0;
    const voiced = typeof metrics?.voicedRatio === "number" ? metrics.voicedRatio : 0;
    const confidence = typeof metrics?.confidenceAvg === "number" ? metrics.confidenceAvg : prev.confidence;
    return {
        ...prev,
        updatedAt: Date.now(),
        biasCents: lerp(prev.biasCents, bias, t),
        driftCentsPerSec: lerp(prev.driftCentsPerSec, drift, t),
        wobbleCents: lerp(prev.wobbleCents, wobble, t),
        overshootRate: lerp(prev.overshootRate, over, t),
        voicedRatio: lerp(prev.voicedRatio, voiced, t),
        confidence: Math.max(0.1, Math.min(1, lerp(prev.confidence, confidence, 0.12))),
    };
}
function buildSummary(drill, metrics, score) {
    const lines = [];
    const kind = drill.type.replace(/_/g, " ");
    if (score >= 85)
        lines.push(`Premium ${kind}. You’re locking in fast.`);
    else if (score >= 70)
        lines.push(`Solid ${kind}. Keep it clean.`);
    else if (score >= 60)
        lines.push(`Good reps. Next one will land.`);
    else
        lines.push(`Rough take — but that’s data. We adapt.`);
    if (typeof metrics?.avgAbsCents === "number") {
        const a = Math.round(metrics.avgAbsCents);
        if (a <= 18)
            lines.push("Accuracy is tightening.");
        else if (a <= 30)
            lines.push("Aim closer to the center of the note.");
    }
    if (typeof metrics?.wobbleCents === "number") {
        const w = Math.round(metrics.wobbleCents);
        if (w <= 12)
            lines.push("Pitch is steady.");
        else if (w >= 22)
            lines.push("Hold steadier — don’t ‘shake’ the note.");
    }
    return lines.join(" ");
}
