"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PitchEngine = void 0;
const pcm_1 = require("../audio/pcm");
const hzToNote_1 = require("./hzToNote");
const yin_1 = require("./yin");
const smoothing_1 = require("./smoothing");
const vad_1 = require("./vad");
class PitchEngine {
    opts;
    ring;
    write = 0;
    filled = 0;
    smoother = new smoothing_1.PitchSmoother();
    // Reuse analysis window to avoid per-frame allocations (GC/jank on low-end devices).
    windowBuf;
    yinWs;
    lastFrameRms = 0;
    lastFramePeak = 0;
    lastFrameClipped = false;
    // Optional decode buffer for base64 PCM path (driver compatibility).
    // This avoids per-frame allocations when the platform can only deliver base64.
    decodeBuf;
    constructor(opts) {
        this.opts = {
            windowSize: opts.windowSize ?? 2048,
            ringSize: opts.ringSize ?? 4096,
            minFreq: opts.minFreq ?? 70,
            maxFreq: opts.maxFreq ?? 900,
            yinThreshold: opts.yinThreshold ?? 0.12,
            noiseGateRms: opts.noiseGateRms,
            minConfidence: opts.minConfidence,
            sampleRate: opts.sampleRate,
        };
        this.ring = new Float32Array(this.opts.ringSize);
        this.windowBuf = new Float32Array(this.opts.windowSize);
        // tauMax+1 is always <= windowSize, so allocating to windowSize guarantees reuse.
        this.yinWs = { diff: new Float32Array(this.opts.windowSize), cmnd: new Float32Array(this.opts.windowSize) };
    }
    reset() {
        this.write = 0;
        this.filled = 0;
        this.smoother.reset();
        this.lastFrameRms = 0;
    }
    pushPcmBase64(pcmBase64) {
        // Reuse buffer when possible to reduce GC.
        const frame = (0, pcm_1.pcmBase64ToFloat32)(pcmBase64, this.decodeBuf);
        this.decodeBuf = frame;
        this.ingestSamples(frame);
        return this.analyze();
    }
    pushSamples(frame) {
        this.ingestSamples(frame);
        return this.analyze();
    }
    /**
     * Fast path: write samples into the ring without doing YIN.
     * Use this to reduce CPU by analyzing every Nth frame.
     */
    ingestSamples(frame) {
        this.writeFrame(frame);
    }
    /** Run pitch analysis over the current window (if enough data exists). */
    analyze() {
        return this.read();
    }
    getLastFrameRms() {
        return this.lastFrameRms;
    }
    getLastFramePeak() {
        return this.lastFramePeak;
    }
    getLastFrameClipped() {
        return this.lastFrameClipped;
    }
    writeFrame(frame) {
        // Track RMS for diagnostics without a second pass elsewhere.
        let sum = 0;
        let peak = 0;
        for (let i = 0; i < frame.length; i++) {
            const v = frame[i];
            this.ring[this.write] = v;
            this.write = (this.write + 1) % this.ring.length;
            this.filled = Math.min(this.ring.length, this.filled + 1);
            sum += v * v;
            const a = Math.abs(v);
            if (a > peak)
                peak = a;
        }
        this.lastFrameRms = Math.sqrt(sum / Math.max(1, frame.length));
        this.lastFramePeak = peak;
        // Conservative clip detection; true peaks can be higher than samples, but this is a safe warning.
        this.lastFrameClipped = peak >= 0.98;
    }
    read() {
        if (this.filled < this.opts.windowSize)
            return null;
        const { w, r } = this.getWindowAndRms(this.opts.windowSize);
        const vad = (0, vad_1.vadFromRms)(r, this.opts.noiseGateRms);
        if (!vad.voiced)
            return null;
        const yin = (0, yin_1.yinDetect)(w, this.opts.sampleRate, {
            minFreq: this.opts.minFreq,
            maxFreq: this.opts.maxFreq,
            threshold: this.opts.yinThreshold,
        }, this.yinWs);
        if (!yin.freqHz || yin.confidence < this.opts.minConfidence)
            return null;
        const smoothHz = this.smoother.push(yin.freqHz);
        const noteInfo = (0, hzToNote_1.hzToNote)(smoothHz);
        return {
            ts: Date.now(),
            freqHz: smoothHz,
            confidence: yin.confidence,
            note: noteInfo.note,
            cents: noteInfo.cents,
            rms: r,
            voiced: true,
        };
    }
    getWindowAndRms(size) {
        // Keep it flexible (in case windowSize is tuned), but still reuse buffers.
        if (this.windowBuf.length !== size) {
            this.windowBuf = new Float32Array(size);
            this.yinWs = { diff: new Float32Array(size), cmnd: new Float32Array(size) };
        }
        const out = this.windowBuf;
        const start = (this.write - size + this.ring.length) % this.ring.length;
        let sum = 0;
        for (let i = 0; i < size; i++) {
            const v = this.ring[(start + i) % this.ring.length];
            out[i] = v;
            sum += v * v;
        }
        const r = Math.sqrt(sum / Math.max(1, size));
        return { w: out, r };
    }
}
exports.PitchEngine = PitchEngine;
