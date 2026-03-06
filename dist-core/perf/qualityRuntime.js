"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQualityConfig = void 0;
exports.initQualityRuntime = initQualityRuntime;
exports.stopQualityRuntime = stopQualityRuntime;
exports.setQualityOverride = setQualityOverride;
exports.getQualityState = getQualityState;
exports.getQualityConfigSnapshot = getQualityConfigSnapshot;
exports.subscribeQuality = subscribeQuality;
const react_native_1 = require("react-native");
const qualityHeuristics_1 = require("./qualityHeuristics");
const perfMonitor_1 = require("./perfMonitor");
const listeners = new Set();
let timer = null;
let tier = 'MID';
let mode = 'AUTO';
let resolved = 'BALANCED';
let stableSince = Date.now();
function initQualityRuntime(opts) {
    if (timer)
        return;
    const { width, height } = react_native_1.Dimensions.get('window');
    const scale = react_native_1.PixelRatio.get();
    tier = (0, qualityHeuristics_1.classifyDeviceTier)({ width, height, scale });
    mode = opts?.initialMode ?? 'AUTO';
    resolved = mode === 'AUTO' ? (0, qualityHeuristics_1.initialQualityForTier)(tier) : mode;
    stableSince = Date.now();
    emit();
    // Perf snapshot is used by AUTO mode heuristics (stalls + FrameBus pressure).
    // This is safe to run in production; it stays local unless the user opts into telemetry.
    (0, perfMonitor_1.startPerfMonitor)();
    // AUTO adaptation loop (cheap). We do not adapt in manual modes.
    timer = setInterval(() => {
        if (mode !== 'AUTO')
            return;
        if ((0, qualityHeuristics_1.shouldDegrade)(resolved)) {
            stableSince = Date.now();
            resolved = resolved === 'HIGH' ? 'BALANCED' : 'LITE';
            emit();
            return;
        }
        const stableWindowMs = Date.now() - stableSince;
        if ((0, qualityHeuristics_1.shouldUpgrade)(stableWindowMs, resolved)) {
            // Upgrade one step at a time.
            resolved = resolved === 'LITE' ? 'BALANCED' : 'HIGH';
            stableSince = Date.now();
            emit();
        }
    }, 1000);
}
function stopQualityRuntime() {
    if (!timer)
        return;
    clearInterval(timer);
    timer = null;
}
function setQualityOverride(next) {
    mode = next;
    resolved = mode === 'AUTO' ? (0, qualityHeuristics_1.initialQualityForTier)(tier) : mode;
    stableSince = Date.now();
    emit();
}
function getQualityState() {
    const config = (0, qualityHeuristics_1.getQualityConfig)(mode, tier);
    return { mode, resolved, tier, config };
}
function getQualityConfigSnapshot() {
    return (0, qualityHeuristics_1.getQualityConfig)(mode, tier);
}
// Back-compat name used by existing imports.
exports.getQualityConfig = getQualityConfigSnapshot;
function subscribeQuality(listener) {
    listeners.add(listener);
    listener(getQualityState());
    return () => {
        listeners.delete(listener);
    };
}
function emit() {
    const st = getQualityState();
    for (const l of listeners)
        l(st);
}
