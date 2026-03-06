"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.getRecentLogs = getRecentLogs;
exports.setCoreLogger = setCoreLogger;
exports.coreInfo = coreInfo;
exports.coreWarn = coreWarn;
exports.coreError = coreError;
// Small in-memory ring buffer for support/debug exports (offline-first).
// NOTE: stays local unless the user shares it explicitly.
const RING_MAX = 400;
let ring = [];
function pushRing(e) {
    ring.push(e);
    if (ring.length > RING_MAX)
        ring = ring.slice(ring.length - RING_MAX);
}
function getRecentLogs(opts) {
    const since = opts?.sinceMs ?? 0;
    const out = ring.filter((e) => e.atMs >= since);
    const lim = opts?.limit ?? 200;
    return out.slice(Math.max(0, out.length - lim));
}
let _logger = {
    info: () => { },
    warn: (message, meta) => {
        if (__DEV__)
            console.warn(message, meta ?? {});
    },
    error: (message, meta) => {
        if (__DEV__)
            console.error(message, meta ?? {});
    },
};
function setCoreLogger(next) {
    _logger = next;
}
function coreInfo(message, meta) {
    pushRing({ level: 'info', message, meta, atMs: Date.now() });
    try {
        _logger.info?.(message, meta);
    }
    catch { }
}
function coreWarn(message, meta) {
    pushRing({ level: 'warn', message, meta, atMs: Date.now() });
    try {
        _logger.warn(message, meta);
    }
    catch { }
}
function coreError(message, meta) {
    pushRing({ level: 'error', message, meta, atMs: Date.now() });
    try {
        _logger.error(message, meta);
    }
    catch { }
}
// Convenience object used by most call sites.
exports.logger = {
    info: coreInfo,
    warn: coreWarn,
    error: coreError,
};
