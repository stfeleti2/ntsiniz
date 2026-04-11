"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMicPermissionState = getMicPermissionState;
exports.requestMicPermission = requestMicPermission;
exports.ensureMicPermission = ensureMicPermission;
exports.startMic = startMic;
const expo_stream_audio_1 = require("expo-stream-audio");
const expo_av_1 = require("expo-av");
async function getMicPermissionState() {
    try {
        const permission = (await expo_av_1.Audio.getPermissionsAsync());
        if (permission.granted)
            return 'granted';
        if (permission.status === 'undetermined')
            return 'notRequested';
        if (permission.canAskAgain === false)
            return 'blocked';
        return 'denied';
    }
    catch {
        return 'error';
    }
}
async function requestMicPermission() {
    try {
        const permission = (await expo_av_1.Audio.requestPermissionsAsync());
        if (permission.granted)
            return 'granted';
        if (permission.canAskAgain === false)
            return 'blocked';
        return 'denied';
    }
    catch {
        return 'error';
    }
}
async function ensureMicPermission() {
    const current = await getMicPermissionState();
    if (current === 'granted')
        return true;
    if (current === 'blocked')
        return false;
    const next = await requestMicPermission();
    return next === 'granted';
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
