"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVoiceDspSession = createVoiceDspSession;
const pcm_1 = require("../pcm");
const EPS = 1e-7;
const DEFAULT_NOISE_FLOOR = 0.004;
const QUALITY_WINDOW = 90;
function createVoiceDspSession(options) {
    return new VoiceDspSession(options);
}
class VoiceDspSession {
    sampleRate;
    suppressionMode;
    native = loadNativeDsp();
    nativeSessionId;
    frameCount = 0;
    sumVad = 0;
    sumSnr = 0;
    sumNoiseFloorDb = 0;
    voicedFrames = 0;
    clippedFrames = 0;
    silenceFrames = 0;
    noiseFloor = DEFAULT_NOISE_FLOOR;
    routeFingerprint = null;
    routeChangedAt = null;
    recentVoiced = [];
    recentClipping = [];
    recentSilence = [];
    constructor(options) {
        this.sampleRate = options.sampleRate;
        this.suppressionMode = options.suppressionMode ?? 'conservativeAdaptive';
        try {
            this.nativeSessionId = this.native?.createSession
                ? this.native.createSession({
                    sampleRate: options.sampleRate,
                    suppressionMode: this.suppressionMode,
                })
                : null;
        }
        catch {
            this.nativeSessionId = null;
        }
    }
    pushFrame(input) {
        const ts = input.timestampMs ?? Date.now();
        const nativeOut = this.nativeSessionId && input.pcmBase64 ? this.tryNativeFrame(this.nativeSessionId, input.pcmBase64, input.sampleRate) : null;
        const needsJs = !nativeOut || !!input.samples;
        const samples = needsJs ? resolveSamples(input) : null;
        const frameRms = samples ? (0, pcm_1.rms)(samples) : dbToLinear((nativeOut?.noiseFloorDb ?? -40) + (nativeOut?.snrDb ?? 0));
        const peak = samples ? computePeak(samples) : nativeOut?.clipping ? 0.99 : 0.08;
        const clipping = nativeOut?.clipping ?? peak >= 0.985;
        this.applyRouteHealth(input.routeFingerprint ?? null, ts);
        const routeHealth = this.routeHealth(ts);
        const noiseBefore = nativeOut ? dbToLinear(nativeOut.noiseFloorDb) : this.noiseFloor;
        const snrDb = nativeOut?.snrDb ?? ratioToDb(frameRms, noiseBefore);
        const vadProb = nativeOut?.vadProb ?? estimateVadProb(frameRms, snrDb, zeroCrossingRate(samples ?? new Float32Array(0)));
        const voiced = vadProb >= 0.56 && frameRms >= noiseBefore * 1.12;
        if (nativeOut) {
            this.noiseFloor = clampNoiseFloor(dbToLinear(nativeOut.noiseFloorDb));
        }
        else if (!voiced) {
            const smoothing = this.suppressionMode === 'off' ? 0.02 : 0.08;
            this.noiseFloor = clampNoiseFloor(this.noiseFloor * (1 - smoothing) + frameRms * smoothing);
        }
        else {
            // Conservative denoise floor drift so we avoid over-shaping sung timbre.
            this.noiseFloor = clampNoiseFloor(this.noiseFloor * 0.995 + frameRms * 0.005);
        }
        this.frameCount += 1;
        if (voiced)
            this.voicedFrames += 1;
        if (clipping)
            this.clippedFrames += 1;
        if (vadProb < 0.24)
            this.silenceFrames += 1;
        this.sumVad += vadProb;
        this.sumSnr += snrDb;
        this.sumNoiseFloorDb += ratioToDb(this.noiseFloor, 1);
        const voicedRatio = pushWindowValue(this.recentVoiced, nativeOut?.voicedRatio ?? (voiced ? 1 : 0));
        const clippingRate = pushWindowValue(this.recentClipping, clipping ? 1 : 0);
        const silenceRate = pushWindowValue(this.recentSilence, vadProb < 0.24 ? 1 : 0);
        const jsQuality = qualityFrom({
            snrDb,
            clippingRate,
            silenceRate,
            voicedRatio,
            routeHealth,
        });
        return {
            ts,
            rms: frameRms,
            peak,
            vadProb,
            voiced,
            noiseFloorDb: ratioToDb(this.noiseFloor, 1),
            snrDb,
            clipping,
            voicedRatio,
            clippingRate,
            silenceRate,
            signalQuality: jsQuality,
            routeHealth,
        };
    }
    summary() {
        const frames = Math.max(1, this.frameCount);
        const voicedRatio = this.voicedFrames / frames;
        const clippingRate = this.clippedFrames / frames;
        const silenceRate = this.silenceFrames / frames;
        const avgSnrDb = this.sumSnr / frames;
        const avgVadProb = this.sumVad / frames;
        const avgNoiseFloorDb = this.sumNoiseFloorDb / frames;
        return {
            frames: this.frameCount,
            avgVadProb,
            avgSnrDb,
            avgNoiseFloorDb,
            clippingRate,
            silenceRate,
            voicedRatio,
            signalQuality: qualityFrom({
                snrDb: avgSnrDb,
                clippingRate,
                silenceRate,
                voicedRatio,
                routeHealth: this.routeHealth(Date.now()),
            }),
        };
    }
    async close() {
        if (this.nativeSessionId && this.native?.closeSession) {
            try {
                this.native.closeSession(this.nativeSessionId);
            }
            catch {
                // no-op
            }
        }
        return Promise.resolve();
    }
    tryNativeFrame(sessionId, pcmBase64, sampleRate) {
        try {
            if (!this.native?.processFrame)
                return null;
            return this.native.processFrame(sessionId, pcmBase64, sampleRate);
        }
        catch {
            return null;
        }
    }
    applyRouteHealth(nextFingerprint, ts) {
        if (!nextFingerprint)
            return;
        if (!this.routeFingerprint) {
            this.routeFingerprint = nextFingerprint;
            return;
        }
        if (nextFingerprint === this.routeFingerprint)
            return;
        this.routeFingerprint = nextFingerprint;
        this.routeChangedAt = ts;
    }
    routeHealth(ts) {
        if (!this.routeChangedAt)
            return 'stable';
        const delta = ts - this.routeChangedAt;
        if (delta < 900)
            return 'changed';
        if (delta < 4000)
            return 'unstable';
        return 'stable';
    }
}
let cachedNativeModule;
function loadNativeDsp() {
    if (cachedNativeModule !== undefined)
        return cachedNativeModule;
    try {
        const req = globalThis?.require ?? (0, eval)('require');
        const mod = req('ntsiniz-voice-dsp');
        const api = (mod?.default ?? mod);
        if (typeof api?.createSession === 'function' && typeof api?.processFrame === 'function' && typeof api?.closeSession === 'function') {
            cachedNativeModule = api;
            return cachedNativeModule;
        }
    }
    catch {
        // no-op
    }
    cachedNativeModule = null;
    return cachedNativeModule;
}
function resolveSamples(input) {
    if (input.samples)
        return input.samples;
    if (input.pcmBase64)
        return (0, pcm_1.pcmBase64ToFloat32)(input.pcmBase64);
    return new Float32Array(0);
}
function ratioToDb(value, floor) {
    return 20 * Math.log10((value + EPS) / (floor + EPS));
}
function dbToLinear(db) {
    return 10 ** (db / 20);
}
function computePeak(samples) {
    let peak = 0;
    for (let idx = 0; idx < samples.length; idx += 1) {
        const v = Math.abs(samples[idx] ?? 0);
        if (v > peak)
            peak = v;
    }
    return peak;
}
function zeroCrossingRate(samples) {
    if (samples.length < 2)
        return 0;
    let crossings = 0;
    for (let idx = 1; idx < samples.length; idx += 1) {
        if ((samples[idx - 1] ?? 0) * (samples[idx] ?? 0) < 0)
            crossings += 1;
    }
    return crossings / (samples.length - 1);
}
function estimateVadProb(frameRms, snrDb, zcr) {
    const snrComponent = sigmoid((snrDb - 6) / 4.5);
    const levelComponent = sigmoid((frameRms - 0.011) * 160);
    const zcrPenalty = zcr > 0.35 ? 0.8 : 1;
    return clamp01((snrComponent * 0.62 + levelComponent * 0.38) * zcrPenalty);
}
function qualityFrom(input) {
    if (input.routeHealth !== 'stable')
        return 'blocked';
    if (input.clippingRate > 0.16)
        return 'poor';
    if (input.snrDb < 5)
        return 'poor';
    if (input.silenceRate > 0.82 && input.voicedRatio < 0.08)
        return 'poor';
    if (input.snrDb < 10)
        return 'fair';
    if (input.voicedRatio < 0.12 && input.silenceRate > 0.7)
        return 'fair';
    if (input.snrDb < 17)
        return 'good';
    return 'excellent';
}
function sigmoid(value) {
    return 1 / (1 + Math.exp(-value));
}
function pushWindowValue(window, value) {
    window.push(value);
    if (window.length > QUALITY_WINDOW)
        window.shift();
    return window.reduce((sum, item) => sum + item, 0) / Math.max(1, window.length);
}
function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}
function clampNoiseFloor(value) {
    return Math.max(0.0008, Math.min(0.18, value));
}
