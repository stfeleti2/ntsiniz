"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAudioRouteSupervisor = startAudioRouteSupervisor;
const routeBroker_1 = require("./routeBroker");
const audioFormatProbe_1 = require("./audioFormatProbe");
const logger_1 = require("@/core/observability/logger");
let started = false;
/**
 * Central supervisor to keep audio probes/policies consistent across the app.
 * - Invalidate probe cache on route changes (e.g. Bluetooth connect/disconnect)
 * - Best-effort re-probe so screens can rely on fresh values.
 */
function startAudioRouteSupervisor() {
    if (started)
        return () => { };
    started = true;
    let prevFp = null;
    const unsub = routeBroker_1.routeBroker.subscribe((s) => {
        if (!s.route)
            return;
        const fp = `${s.route.routeType}|${s.route.inputName ?? ''}|${s.route.outputName ?? ''}`;
        if (!prevFp) {
            prevFp = fp;
            return;
        }
        if (fp === prevFp)
            return;
        prevFp = fp;
        (0, audioFormatProbe_1.invalidateAudioInputFormatCache)();
        // Best-effort refresh (do not block UI).
        (0, audioFormatProbe_1.probeAudioInputFormat)().catch((err) => logger_1.logger.warn('audio format re-probe failed', err));
    });
    return () => {
        try {
            unsub();
        }
        finally {
            started = false;
        }
    };
}
