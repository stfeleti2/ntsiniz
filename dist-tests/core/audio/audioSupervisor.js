"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAudioSupervisor = initAudioSupervisor;
exports.stopAudioSupervisor = stopAudioSupervisor;
exports.getAudioSupervisorSnapshot = getAudioSupervisorSnapshot;
const interruptions_1 = require("./interruptions");
const routeSupervisor_1 = require("./routeSupervisor");
const routeBroker_1 = require("./routeBroker");
const logger_1 = require("@/core/observability/logger");
let startedAtMs = 0;
let routeChangeCount = 0;
let interruptionCount = 0;
let audioSessionErrorCount = 0;
let started = false;
let unsubs = [];
let lastInterruption = null;
function routeFingerprint(routeType, inputName, outputName) {
    return `${routeType}|${inputName ?? ''}|${outputName ?? ''}`;
}
/**
 * Single bootstrap for "audio correctness" lifecycle.
 * It unifies:
 * - route broker start
 * - interruption events
 * - probe cache invalidation on route changes
 */
function initAudioSupervisor() {
    if (started)
        return () => { };
    started = true;
    startedAtMs = Date.now();
    // Fresh counters per lifecycle.
    routeChangeCount = 0;
    interruptionCount = 0;
    audioSessionErrorCount = 0;
    lastInterruption = null;
    const stopInterruptions = (0, interruptions_1.initInterruptions)();
    unsubs.push(stopInterruptions);
    // Keep a central route supervisor running.
    const stopRouteSupervisor = (0, routeSupervisor_1.startAudioRouteSupervisor)();
    unsubs.push(stopRouteSupervisor);
    // Count route changes (subscribe is cheap and already centralized).
    let prevRouteFp = null;
    unsubs.push(routeBroker_1.routeBroker.subscribe((s) => {
        if (!s.route)
            return;
        const fp = routeFingerprint(s.route.routeType, s.route.inputName, s.route.outputName);
        if (!prevRouteFp) {
            prevRouteFp = fp;
            return;
        }
        if (fp === prevRouteFp)
            return;
        prevRouteFp = fp;
        routeChangeCount += 1;
    }));
    // Count interruptions and audio session errors.
    unsubs.push((0, interruptions_1.onInterruption)((e) => {
        lastInterruption = e;
        if (e.type === 'audio_session_error')
            audioSessionErrorCount += 1;
        interruptionCount += 1;
    }));
    logger_1.logger.info('audioSupervisor inited');
    return () => stopAudioSupervisor();
}
function stopAudioSupervisor() {
    if (!started)
        return;
    for (const u of unsubs) {
        try {
            u();
        }
        catch (e) {
            logger_1.logger.warn('audioSupervisor unsubscribe failed', { error: e });
        }
    }
    unsubs = [];
    started = false;
    // Avoid stale values after hot reload / remount.
    startedAtMs = 0;
    routeChangeCount = 0;
    interruptionCount = 0;
    audioSessionErrorCount = 0;
    lastInterruption = null;
}
function getAudioSupervisorSnapshot() {
    return {
        startedAtMs,
        routeChangeCount,
        interruptionCount,
        audioSessionErrorCount,
        lastInterruption,
    };
}
