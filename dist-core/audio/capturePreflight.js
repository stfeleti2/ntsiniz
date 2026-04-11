"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCapturePreflight = runCapturePreflight;
const micStream_1 = require("./micStream");
const routeManager_1 = require("./routeManager");
async function runCapturePreflight(settings, opts) {
    const permissionState = await resolvePermissionState(settings);
    const permissionGranted = permissionState === 'granted';
    if (!permissionGranted) {
        return {
            permissionGranted: false,
            permissionState,
            route: null,
            routeStabilityScore: 0,
            stable: false,
            preferredSampleRate: 48000,
        };
    }
    await (0, routeManager_1.configureForVocalCapture)({
        allowBluetooth: settings.allowBluetoothMic ?? true,
        preferBuiltInMic: settings.preferBuiltInMic ?? false,
        preferredSampleRateHz: 48000,
        preferredIOBufferDurationMs: 10,
    }).catch(() => { });
    if (settings.preferredInputUid) {
        await (0, routeManager_1.setPreferredInput)(settings.preferredInputUid).catch(() => { });
    }
    const windowMs = Math.max(240, opts?.stabilityWindowMs ?? 620);
    const pollEveryMs = 120;
    const startedAt = Date.now();
    let route = await (0, routeManager_1.getCurrentRoute)().catch(() => null);
    let previousFingerprint = routeFingerprint(route);
    let changes = 0;
    while (Date.now() - startedAt < windowMs) {
        await sleep(pollEveryMs);
        const next = await (0, routeManager_1.getCurrentRoute)().catch(() => null);
        const nextFingerprint = routeFingerprint(next);
        if (previousFingerprint && nextFingerprint && previousFingerprint !== nextFingerprint) {
            changes += 1;
        }
        if (nextFingerprint)
            previousFingerprint = nextFingerprint;
        route = next ?? route;
    }
    const routeStabilityScore = clamp01(1 - changes * 0.34);
    const preferredSampleRate = route?.sampleRateHz && route.sampleRateHz >= 32000
        ? Math.round(route.sampleRateHz)
        : settings.preferredSampleRate && settings.preferredSampleRate >= 32000
            ? Math.round(settings.preferredSampleRate)
            : 48000;
    return {
        permissionGranted: true,
        permissionState: 'granted',
        route,
        routeStabilityScore,
        stable: routeStabilityScore >= 0.62,
        preferredSampleRate,
    };
}
async function resolvePermissionState(settings) {
    if (settings.qaBypassMicPermission)
        return 'granted';
    const initial = await (0, micStream_1.getMicPermissionState)().catch(() => 'error');
    if (initial === 'granted' || initial === 'blocked')
        return initial;
    return await (0, micStream_1.requestMicPermission)().catch(() => 'error');
}
function routeFingerprint(route) {
    if (!route)
        return null;
    return `${route.routeType}|${route.inputUid ?? ''}|${route.sampleRateHz ?? ''}|${route.channels ?? ''}`;
}
function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
