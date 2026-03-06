"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAttemptWavRecorder = createAttemptWavRecorder;
const FileSystem = __importStar(require("expo-file-system/legacy"));
const fileStore_1 = require("@/core/io/fileStore");
const base64_js_1 = require("base64-js");
const wav_1 = require("./wav");
const nativeWavWriter_1 = require("./nativeWavWriter");
const takeFilesRepo_1 = require("@/core/storage/takeFilesRepo");
const id_1 = require("@/core/util/id");
const logger_1 = require("@/core/observability/logger");
const qualityRuntime_1 = require("@/core/perf/qualityRuntime");
/**
 * Captures mic frames (PCM16 base64 or Float32 samples) and writes a WAV file.
 * Stores in FileSystem.cacheDirectory (safe to purge by OS).
 */
function createAttemptWavRecorder(params) {
    // Default ~2 minutes @ 20ms frames. Keeps Phase-1 drills safe without truncation.
    const { sampleRate, maxFrames = 6000, waveformBars = 72 } = params;
    const MAX_FALLBACK_DURATION_MS = 3 * 60 * 1000;
    const chunks = [];
    const framePeaks = [];
    let totalSamples = 0;
    let frames = 0;
    let aborted = false;
    // Optional native streaming writer (no base64, no full-file buffering).
    const native = (0, nativeWavWriter_1.getNativeWavWriter)();
    const base = FileSystem.cacheDirectory;
    const dir = base ? `${base}ntsiniz/takes` : null;
    // Avoid millisecond collisions on fast retries.
    const filename = `take_${(0, id_1.id)('take')}.wav`;
    const uriPlanned = dir ? `${dir}/${filename}` : null;
    const tmpUriPlanned = uriPlanned ? `${uriPlanned}.tmp` : null;
    let nativeOpened = null;
    let nativeOpenPromise = null;
    let nativeChain = Promise.resolve();
    let nativePendingB64 = [];
    const batchFrames = Math.max(1, Math.min(6, (0, qualityRuntime_1.getQualityConfigSnapshot)().audioWriteBatchFrames ?? 2));
    const ensureNativeOpen = () => {
        if (!native || nativeOpenPromise || !dir || !uriPlanned || !tmpUriPlanned)
            return;
        nativeOpened = { tmpUri: tmpUriPlanned, uri: uriPlanned };
        // Start directory create + open in the background; do NOT await in push.
        nativeOpenPromise = FileSystem.makeDirectoryAsync(dir, { intermediates: true })
            .catch((e) => logger_1.logger.warn('native wav writer: makeDirectory failed', { error: e }))
            .then(() => fileStore_1.fileStore.deleteIfExists(tmpUriPlanned).catch((e) => logger_1.logger.warn('native wav writer: tmp delete failed', { error: e })))
            .then(() => (0, takeFilesRepo_1.upsertTakeFile)({ path: uriPlanned, tmpPath: tmpUriPlanned, status: 'saving', meta: { sampleRate } }).catch((e) => logger_1.logger.warn('native wav writer: db upsert saving failed', { error: e })))
            .then(() => native.open(tmpUriPlanned, { sampleRate, channels: 1 }))
            .catch((e) => logger_1.logger.warn('native wav writer: open failed', { error: e }));
    };
    const push = (frame) => {
        if (aborted)
            return;
        if (frames >= maxFrames)
            return;
        frames += 1;
        // Fallback path (no native writer): prevent very long takes from causing memory/GC spikes.
        if (!native) {
            const durMs = (totalSamples / sampleRate) * 1000;
            if (durMs >= MAX_FALLBACK_DURATION_MS)
                return;
        }
        if (frame.pcmBase64) {
            try {
                if (native)
                    ensureNativeOpen();
                // Compute sample count without decoding the full buffer.
                const byteLen = base64ByteLength(frame.pcmBase64);
                totalSamples += Math.floor(byteLen / 2);
                if (native && nativeOpened) {
                    // Stream to native writer. Prefer batching to reduce bridge overhead.
                    nativePendingB64.push(frame.pcmBase64);
                    const shouldFlush = nativePendingB64.length >= batchFrames || !native.appendPcm16leBase64Batch;
                    if (shouldFlush) {
                        const batch = nativePendingB64;
                        nativePendingB64 = [];
                        nativeChain = nativeChain
                            .then(() => nativeOpenPromise)
                            .then(() => (native.appendPcm16leBase64Batch ? native.appendPcm16leBase64Batch(batch) : native.appendPcm16leBase64(batch[0])))
                            .then((r) => {
                            // Peak/clipping computed natively (batch returns max peak across batch).
                            if (r && typeof r.peak === 'number')
                                framePeaks.push(Math.min(1, Math.max(0, r.peak / 32767)));
                            else
                                framePeaks.push(fastPeakFromBase64Pcm16le(batch[0]));
                            return undefined;
                        })
                            .catch(() => {
                            framePeaks.push(fastPeakFromBase64Pcm16le(batch[0]));
                            return undefined;
                        });
                    }
                }
                else {
                    // JS fallback: decode once to bytes (still needed for writing).
                    const bytes = (0, base64_js_1.toByteArray)(frame.pcmBase64);
                    chunks.push(bytes);
                    framePeaks.push(peakAbsI16(bytes));
                }
            }
            catch {
                // ignore bad frames
            }
            return;
        }
        if (frame.samples) {
            const s = frame.samples;
            const out = new Uint8Array(s.length * 2);
            const dv = new DataView(out.buffer);
            let p = 0;
            for (let i = 0; i < s.length; i++) {
                const v = Math.max(-1, Math.min(1, s[i]));
                p = Math.max(p, Math.abs(v));
                const i16 = Math.round(v * 32767);
                dv.setInt16(i * 2, i16, true);
            }
            // Float32 path is primarily for tests/dev. If native writer exists we
            // still buffer (rare), since converting to base64 per-frame would be expensive.
            chunks.push(out);
            totalSamples += s.length;
            framePeaks.push(p);
        }
    };
    const abort = () => {
        aborted = true;
        chunks.length = 0;
        framePeaks.length = 0;
        totalSamples = 0;
        if (native && nativeOpened)
            native.abort?.().catch((e) => logger_1.logger.warn('native wav writer: abort failed', { error: e }));
    };
    const finalize = async () => {
        if (aborted)
            return null;
        if (!chunks.length && !native)
            return null;
        if (!base || !dir || !uriPlanned || !tmpUriPlanned)
            return null;
        try {
            await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch((e) => logger_1.logger.warn('wav finalize: makeDirectory failed', { error: e }));
            const uri = uriPlanned;
            // Atomic save: write to temp first, then rename.
            const tmpUri = tmpUriPlanned;
            await fileStore_1.fileStore.deleteIfExists(tmpUri).catch((e) => logger_1.logger.warn('wav finalize: tmp delete failed', { error: e }));
            // Ensure we have a journal row (push may not have started native open).
            await (0, takeFilesRepo_1.upsertTakeFile)({ path: uri, tmpPath: tmpUri, status: 'saving', meta: { sampleRate } }).catch((e) => logger_1.logger.warn('wav finalize: db upsert saving failed', { error: e }));
            // If native writer exists, stream writes to tmpUri and finalize header.
            if (native) {
                ensureNativeOpen();
                await nativeOpenPromise?.catch((e) => logger_1.logger.warn('native wav writer: open promise failed', { error: e }));
                // Flush any pending batched frames.
                if (nativePendingB64.length) {
                    const batch = nativePendingB64;
                    nativePendingB64 = [];
                    nativeChain = nativeChain
                        .then(() => (native.appendPcm16leBase64Batch ? native.appendPcm16leBase64Batch(batch) : native.appendPcm16leBase64(batch[0])))
                        .then(() => undefined)
                        .catch((e) => logger_1.logger.warn('native wav writer: append batch failed', { error: e }));
                }
                // If we buffered any frames (Float32 path), append them now.
                if (chunks.length) {
                    for (const c of chunks) {
                        // Convert chunk bytes to base64 and append (still incremental, avoids whole-file string).
                        const b64 = (0, base64_js_1.fromByteArray)(c);
                        nativeChain = nativeChain
                            .then(() => native.appendPcm16leBase64(b64))
                            .then(() => undefined)
                            .catch((e) => logger_1.logger.warn('native wav writer: append failed', { error: e }));
                    }
                }
                await nativeChain.catch((e) => logger_1.logger.warn('native wav writer: pending writes failed', { error: e }));
                await native.finalize({ totalSamples }).catch((e) => logger_1.logger.warn('native wav writer: finalize failed', { error: e }));
                await FileSystem.moveAsync({ from: tmpUri, to: uri }).catch((e) => logger_1.logger.warn('wav finalize: move tmp->final failed', { error: e }));
                await (0, takeFilesRepo_1.reconcileTakeFilePaths)([{ from: tmpUri, to: uri }]).catch((e) => logger_1.logger.warn('wav finalize: reconcile tmp->final failed', { error: e }));
                await (0, takeFilesRepo_1.upsertTakeFile)({ path: uri, tmpPath: null, status: 'saved', meta: { sampleRate } }).catch((e) => logger_1.logger.warn('wav finalize: db upsert saved failed', { error: e }));
            }
            else {
                // Expo FS fallback: write full base64.
                const header = (0, wav_1.wavHeader)({ sampleRate, numSamples: totalSamples });
                const b64Parts = new Array(chunks.length + 1);
                b64Parts[0] = (0, base64_js_1.fromByteArray)(header);
                for (let i = 0; i < chunks.length; i++)
                    b64Parts[i + 1] = (0, base64_js_1.fromByteArray)(chunks[i]);
                const b64 = b64Parts.join('');
                await fileStore_1.fileStore.writeBase64(tmpUri, b64);
                await FileSystem.moveAsync({ from: tmpUri, to: uri }).catch((e) => logger_1.logger.warn('wav finalize: move tmp->final failed', { error: e }));
                await (0, takeFilesRepo_1.upsertTakeFile)({ path: uri, tmpPath: null, status: 'saved', meta: { sampleRate } }).catch((e) => logger_1.logger.warn('wav finalize: db upsert saved failed', { error: e }));
            }
            // Best-effort cleanup (keep last ~80 files).
            await cleanupOldTakes(dir, 80).catch(() => { });
            const durationMs = totalSamples > 0 ? Math.round((totalSamples / sampleRate) * 1000) : 0;
            const waveformPeaks = quantizePeaks(downsamplePeaks(framePeaks, waveformBars));
            const peakMax = framePeaks.length ? Math.max(...framePeaks) : 0;
            const peakAvg = framePeaks.length ? framePeaks.reduce((a, b) => a + b, 0) / framePeaks.length : 0;
            const clippedFrames = framePeaks.reduce((n, p) => n + (p >= 0.98 ? 1 : 0), 0);
            return {
                uri,
                sampleRate,
                durationMs,
                waveformPeaks,
                recordingStats: {
                    peakMax,
                    peakAvg,
                    clippedFrames,
                    frames: framePeaks.length,
                },
            };
        }
        catch {
            return null;
        }
    };
    return { push, finalize, abort };
}
function peakAbsI16(bytes) {
    // bytes are little-endian PCM16
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let max = 0;
    for (let i = 0; i + 1 < bytes.byteLength; i += 2) {
        const v = dv.getInt16(i, true);
        const a = Math.abs(v);
        if (a > max)
            max = a;
    }
    return max / 32767;
}
function base64ByteLength(b64) {
    // Base64 length -> bytes length without allocating.
    // Note: base64 may include newlines; mic frames should not.
    const len = b64.length;
    if (!len)
        return 0;
    let padding = 0;
    if (b64[len - 1] === '=')
        padding++;
    if (b64[len - 2] === '=')
        padding++;
    return Math.floor((len * 3) / 4) - padding;
}
function fastPeakFromBase64Pcm16le(b64, maxSamples = 2048) {
    // Fallback peak estimator that does not rely on `atob` (not guaranteed in all RN runtimes).
    // NOTE: This decodes the full frame, but it's only used as a fallback when native stats are unavailable.
    try {
        const bytes = (0, base64_js_1.toByteArray)(b64);
        const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const byteLimit = Math.min(bytes.byteLength, maxSamples * 2);
        let max = 0;
        for (let i = 0; i + 1 < byteLimit; i += 2) {
            const v = dv.getInt16(i, true);
            const a = Math.abs(v);
            if (a > max)
                max = a;
        }
        return max / 32767;
    }
    catch {
        return 0;
    }
}
function downsamplePeaks(peaks, bars) {
    if (!peaks.length)
        return new Array(bars).fill(0);
    const out = [];
    const step = peaks.length / bars;
    for (let i = 0; i < bars; i++) {
        const start = Math.floor(i * step);
        const end = Math.floor((i + 1) * step);
        let m = 0;
        for (let j = start; j < Math.min(peaks.length, Math.max(end, start + 1)); j++) {
            m = Math.max(m, peaks[j] ?? 0);
        }
        out.push(m);
    }
    return out;
}
function quantizePeaks(peaks01) {
    const max = Math.max(0.0001, ...peaks01);
    return peaks01.map((p) => {
        const n = Math.max(0, Math.min(1, p / max));
        return Math.round(n * 100);
    });
}
async function cleanupOldTakes(dir, keep) {
    const files = await FileSystem.readDirectoryAsync(dir);
    const wavs = files.filter((f) => f.endsWith('.wav'));
    const tmps = files.filter((f) => f.endsWith('.wav.tmp') || f.endsWith('.tmp'));
    // Always try to clear stale temp files (they can be left behind on app kill mid-save).
    await Promise.all(tmps.map((f) => FileSystem.deleteAsync(`${dir}/${f}`, { idempotent: true }).catch(() => { })));
    if (wavs.length <= keep)
        return;
    // Sort by filename timestamp (take_<ms>.wav)
    const sorted = [...wavs].sort((a, b) => {
        const am = parseInt(a.replace(/^take_/, '').replace(/\.wav$/, ''), 10);
        const bm = parseInt(b.replace(/^take_/, '').replace(/\.wav$/, ''), 10);
        return am - bm;
    });
    const toDelete = sorted.slice(0, Math.max(0, sorted.length - keep));
    await Promise.all(toDelete.map((f) => FileSystem.deleteAsync(`${dir}/${f}`, { idempotent: true }).catch(() => { })));
}
