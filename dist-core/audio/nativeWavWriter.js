"use strict";
/**
 * Optional native chunked WAV writer.
 *
 * Expo-managed builds: this module will not exist unless you add the optional
 * native implementation under `modules/expo-wav-file-writer` and run prebuild.
 *
 * When available, it enables true streaming writes (no base64, no whole-file
 * in-memory buffers).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNativeWavWriter = getNativeWavWriter;
function getNativeWavWriter() {
    try {
        // Preferred: bundled JS wrapper from our local Expo module package.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pkg = require('ntsiniz-wav-file-writer');
        const mod = (pkg?.default ?? pkg);
        if (mod?.open && mod?.appendPcm16leBase64 && mod?.finalize)
            return mod;
        // Fallback: direct native module (older shape).
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { requireNativeModule } = require('expo-modules-core');
        const direct = requireNativeModule?.('WavFileWriter');
        if (direct?.openAsync) {
            return {
                getInputAudioCapabilities: direct.getInputAudioCapabilitiesAsync,
                open: (path, opts) => direct.openAsync(path, opts.sampleRate, opts.channels),
                appendPcm16leBase64: (b64) => direct.appendPcm16leBase64Async(b64),
                finalize: (opts) => direct.finalizeAsync(opts.totalSamples),
                abort: () => direct.abortAsync?.(),
            };
        }
        return null;
    }
    catch {
        return null;
    }
}
