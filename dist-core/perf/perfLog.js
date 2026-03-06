"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPerfLogging = startPerfLogging;
exports.stopPerfLogging = stopPerfLogging;
exports.getPerfLogSamples = getPerfLogSamples;
exports.exportPerfLog = exportPerfLog;
const FileSystem = __importStar(require("expo-file-system/legacy"));
const Sharing = __importStar(require("expo-sharing"));
const perfMonitor_1 = require("./perfMonitor");
const qualityRuntime_1 = require("./qualityRuntime");
let unsubPerf = null;
let unsubQ = null;
let startedAt = 0;
let lastQuality = (0, qualityRuntime_1.getQualityState)();
const ring = [];
const MAX_SAMPLES = 240; // ~4 minutes at 1Hz
function startPerfLogging() {
    if (unsubPerf)
        return;
    startedAt = Date.now();
    ring.length = 0;
    unsubQ = (0, qualityRuntime_1.subscribeQuality)((q) => {
        lastQuality = q;
    });
    unsubPerf = (0, perfMonitor_1.subscribePerf)((s) => {
        const now = Date.now();
        const sample = {
            t: Math.round((now - startedAt) / 1000),
            p95StallMs: s.p95StallMs,
            worstStallMs: s.worstStallMs,
            lastStallMs: s.lastStallMs,
            stalls: s.stalls,
            frameBusDropped: s.frameBusDropped ?? 0,
            frameBusQueue: s.frameBusQueue ?? 0,
            qualityMode: lastQuality.resolved,
            deviceTier: lastQuality.tier,
        };
        ring.push(sample);
        while (ring.length > MAX_SAMPLES)
            ring.shift();
    });
}
function stopPerfLogging() {
    if (unsubPerf)
        unsubPerf();
    if (unsubQ)
        unsubQ();
    unsubPerf = null;
    unsubQ = null;
}
function getPerfLogSamples() {
    return [...ring];
}
async function exportPerfLog(opts) {
    const q = (0, qualityRuntime_1.getQualityState)();
    const s = (0, perfMonitor_1.getPerfSnapshot)();
    // Convert ring to the analyzer schema
    const out = {
        device: { tier: q.tier, model: opts?.model },
        mode: q.resolved,
        windowSec: ring.length ? ring[ring.length - 1].t : 0,
        samples: ring.map((x) => ({ t: x.t, p95StallMs: x.p95StallMs, worstStallMs: x.worstStallMs, frameBusDropped: x.frameBusDropped })),
    };
    const dir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
    const filename = `perf_log_${q.tier}_${q.resolved}_${Date.now()}.json`;
    const uri = `${dir}${filename}`;
    await FileSystem.writeAsStringAsync(uri, JSON.stringify(out, null, 2), { encoding: FileSystem.EncodingType.UTF8 });
    if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
    }
    return { uri, summary: { p95: s.p95StallMs, worst: s.worstStallMs, drops: s.frameBusDropped ?? 0 } };
}
