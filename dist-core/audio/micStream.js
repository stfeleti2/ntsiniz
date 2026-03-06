"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureMicPermission = ensureMicPermission;
exports.startMic = startMic;
const expo_stream_audio_1 = require("expo-stream-audio");
async function ensureMicPermission() {
    const res = await (0, expo_stream_audio_1.requestPermission)();
    return res === "granted" || res?.status === "granted";
}
async function startMic(cfg, onFrame, onError) {
    const frameSub = (0, expo_stream_audio_1.addFrameListener)(onFrame);
    const errorSub = (0, expo_stream_audio_1.addErrorListener)((e) => onError?.(e?.message ?? String(e)));
    await (0, expo_stream_audio_1.start)({
        sampleRate: cfg.sampleRate,
        frameDurationMs: cfg.frameDurationMs,
        enableLevelMeter: true,
        enableBackground: false,
    });
    return {
        stop: async () => {
            frameSub?.remove?.();
            errorSub?.remove?.();
            await (0, expo_stream_audio_1.stop)();
        },
    };
}
