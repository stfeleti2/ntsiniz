"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateAudioInputFormatCache = invalidateAudioInputFormatCache;
exports.probeAudioInputFormat = probeAudioInputFormat;
const nativeWavWriter_1 = require("./nativeWavWriter");
let _cache = null;
/** Invalidate cached probe results (call after route changes). */
function invalidateAudioInputFormatCache() {
    _cache = null;
}
/**
 * Probe audio input capabilities.
 *
 * - Uses optional native module when available.
 * - Falls back to safe defaults when running in Expo Go / web / tests.
 */
async function probeAudioInputFormat() {
    // Cache for a short window to avoid repeated native calls.
    const now = Date.now();
    if (_cache && now - _cache.atMs < 5_000)
        return _cache.value;
    const mod = (0, nativeWavWriter_1.getNativeWavWriter)();
    if (mod?.getInputAudioCapabilities) {
        try {
            const caps = await mod.getInputAudioCapabilities();
            // Ensure stable ordering + de-dupe.
            const uniq = (xs) => Array.from(new Set(xs)).filter((n) => Number.isFinite(n) && n > 0);
            const out = {
                sampleRateHz: caps.sampleRateHz || 48000,
                sampleRate: caps.sampleRateHz || 48000,
                channels: caps.channels || 1,
                ioBufferDurationMs: caps.ioBufferDurationMs || 20,
                bufferDurationMs: caps.ioBufferDurationMs || 20,
                supportedSampleRatesHz: uniq([caps.sampleRateHz || 48000, ...(caps.supportedSampleRatesHz ?? [48000, 44100])]),
                supportedChannelCounts: uniq([caps.channels || 1, ...(caps.supportedChannelCounts ?? [1])]),
            };
            _cache = { value: out, atMs: now };
            return out;
        }
        catch {
            // Fall through.
        }
    }
    const fallback = {
        sampleRateHz: 48000,
        sampleRate: 48000,
        channels: 1,
        ioBufferDurationMs: 20,
        bufferDurationMs: 20,
        supportedSampleRatesHz: [48000, 44100],
        supportedChannelCounts: [1],
    };
    _cache = { value: fallback, atMs: now };
    return fallback;
}
