"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PitchTruth = void 0;
const pitchEngine_1 = require("./pitchEngine");
/**
 * Single source of truth for pitch readings.
 */
class PitchTruth {
    engine;
    confirmN;
    lastStable = null;
    pendingNote = null;
    constructor(cfg) {
        this.engine = new pitchEngine_1.PitchEngine({
            sampleRate: cfg.sampleRate,
            noiseGateRms: cfg.noiseGateRms,
            minConfidence: cfg.minConfidence,
        });
        this.confirmN = Math.max(1, Math.floor(cfg.noteChangeConfirmFrames ?? 2));
    }
    reset() {
        this.engine.reset();
        this.lastStable = null;
        this.pendingNote = null;
    }
    pushPcmBase64(pcmBase64) {
        const r = this.engine.pushPcmBase64(pcmBase64);
        return this.hysteresis(r);
    }
    pushSamples(frame) {
        const r = this.engine.pushSamples(frame);
        return this.hysteresis(r);
    }
    /** Ingest samples without running YIN. */
    ingestSamples(frame) {
        this.engine.ingestSamples(frame);
    }
    /** Analyze current window and apply hysteresis. */
    analyze() {
        return this.hysteresis(this.engine.analyze());
    }
    getLastFrameRms() {
        return this.engine.getLastFrameRms();
    }
    getLastFramePeak() {
        return this.engine.getLastFramePeak();
    }
    getLastFrameClipped() {
        return this.engine.getLastFrameClipped();
    }
    getLastStableReading() {
        return this.lastStable;
    }
    hysteresis(r) {
        if (!r) {
            this.pendingNote = null;
            return null;
        }
        if (!this.lastStable) {
            this.lastStable = r;
            this.pendingNote = null;
            return r;
        }
        if (r.note === this.lastStable.note) {
            this.lastStable = r;
            this.pendingNote = null;
            return r;
        }
        if (!this.pendingNote || this.pendingNote.note !== r.note) {
            this.pendingNote = { note: r.note, frames: 1, reading: r };
            return this.lastStable;
        }
        this.pendingNote.frames += 1;
        this.pendingNote.reading = r;
        if (this.pendingNote.frames >= this.confirmN) {
            this.lastStable = this.pendingNote.reading;
            this.pendingNote = null;
            return this.lastStable;
        }
        return this.lastStable;
    }
}
exports.PitchTruth = PitchTruth;
