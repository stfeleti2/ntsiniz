"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initInterruptions = initInterruptions;
exports.onInterruption = onInterruption;
exports.getLastInterruption = getLastInterruption;
exports.notifyAudioSessionError = notifyAudioSessionError;
const react_native_1 = require("react-native");
const routeBroker_1 = require("./routeBroker");
const logger_1 = require("@/core/observability/logger");
let inited = false;
const handlers = new Set();
let lastEvent = null;
let cleanupInterruptions = null;
function routeFingerprint(routeType, inputName) {
    return `${routeType}|${inputName ?? ''}`;
}
function initInterruptions() {
    if (inited)
        return cleanupInterruptions ?? (() => { });
    inited = true;
    const unsubs = [];
    let last = react_native_1.AppState.currentState;
    const appSub = react_native_1.AppState.addEventListener('change', (next) => {
        const e = { type: 'app_state', from: last, to: next, atMs: Date.now() };
        last = next;
        lastEvent = e;
        for (const h of handlers)
            h(e);
    });
    unsubs.push(() => {
        try {
            appSub.remove();
        }
        catch {
            // ignore
        }
    });
    // Ensure broker is started (prime is async-safe; we treat the first non-null state as baseline).
    routeBroker_1.routeBroker.start().catch((e) => logger_1.logger.warn('routeBroker start failed', e));
    let prevFingerprint = null;
    const unsubRoute = routeBroker_1.routeBroker.subscribe((s) => {
        if (!s.route)
            return;
        const fp = routeFingerprint(s.route.routeType, s.route.inputName);
        // Baseline on first route snapshot.
        if (!prevFingerprint) {
            prevFingerprint = fp;
            return;
        }
        if (fp === prevFingerprint)
            return;
        prevFingerprint = fp;
        const e = {
            type: 'audio_route',
            routeType: s.route.routeType,
            inputName: s.route.inputName,
            atMs: Date.now(),
        };
        lastEvent = e;
        for (const h of handlers)
            h(e);
    });
    unsubs.push(unsubRoute);
    cleanupInterruptions = () => {
        for (const u of unsubs)
            u();
        cleanupInterruptions = null;
        inited = false;
    };
    return cleanupInterruptions;
}
function onInterruption(handler) {
    handlers.add(handler);
    return () => {
        handlers.delete(handler);
    };
}
function getLastInterruption() {
    return lastEvent;
}
/** Called by AudioSessionManager when setting audio mode fails. */
function notifyAudioSessionError(message) {
    const e = { type: 'audio_session_error', message, atMs: Date.now() };
    lastEvent = e;
    for (const h of handlers)
        h(e);
}
