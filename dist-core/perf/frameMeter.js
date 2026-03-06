"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startFrameMeter = startFrameMeter;
const react_native_1 = require("react-native");
/**
 * Lightweight UI frame meter (dev + evidence capture).
 * Measures rAF cadence over a window; flags "jank" frames when delta > 34ms (~<30fps).
 */
function startFrameMeter() {
    const nowMs = () => (globalThis.performance && typeof globalThis.performance.now === 'function' ? globalThis.performance.now() : Date.now());
    const startedAt = nowMs();
    let last = startedAt;
    let frames = 0;
    let jankFrames = 0;
    let maxDeltaMs = 0;
    let raf = null;
    let stopped = false;
    let appState = react_native_1.AppState.currentState;
    const pauseThresholdMs = 250; // treat longer gaps as pauses/background, not UI jank
    const appSub = react_native_1.AppState.addEventListener('change', (next) => {
        appState = next;
        // Reset timing baseline when we come back.
        if (next === 'active')
            last = nowMs();
    });
    const tick = () => {
        if (stopped)
            return;
        if (appState !== 'active') {
            raf = requestAnimationFrame(tick);
            return;
        }
        const now = nowMs();
        const dt = now - last;
        last = now;
        if (dt > pauseThresholdMs) {
            // Don't count background/scheduler pauses as jank.
            raf = requestAnimationFrame(tick);
            return;
        }
        frames += 1;
        maxDeltaMs = Math.max(maxDeltaMs, dt);
        if (dt > 34)
            jankFrames += 1;
        raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return {
        stop: () => {
            stopped = true;
            if (raf != null)
                cancelAnimationFrame(raf);
            try {
                appSub.remove();
            }
            catch {
                // ignore
            }
            const ended = nowMs();
            const durationMs = Math.max(1, ended - startedAt);
            const fpsAvg = (frames * 1000) / durationMs;
            return {
                frames,
                durationMs,
                fpsAvg,
                jankFrames,
                maxDeltaMs,
                platform: react_native_1.Platform.OS,
            };
        },
    };
}
