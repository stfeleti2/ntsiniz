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
exports.GhostGuideOverlaySkia = GhostGuideOverlaySkia;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
// Skia types are optional at runtime. This file is only imported when Skia is available.
const react_native_skia_1 = require("@shopify/react-native-skia");
/**
 * Skia version of Ghost Guide overlay.
 *
 * Intent:
 * - Draw-only (no heavy per-frame JS layout)
 * - Cull segments outside viewport
 * - Keep visuals simple + fast
 */
function GhostGuideOverlaySkia({ nowMs, reading, drill, performancePlan, msPerPx = 7, semitoneRange = 12, }) {
    const mode = drill ? 'drill' : performancePlan ? 'performance' : 'none';
    const { segments, toleranceCents, targetMidi, tMs } = (0, react_1.useMemo)(() => {
        if (mode === 'performance' && performancePlan) {
            const t = nowMs - performancePlan.startedAtMs;
            const currentTarget = pickTargetMidi(performancePlan.segments, t);
            return {
                segments: performancePlan.segments,
                toleranceCents: performancePlan.toleranceCents,
                targetMidi: currentTarget ?? 69,
                tMs: t,
            };
        }
        if (mode === 'drill' && drill) {
            const activeStart = drill.activeStartedAt || nowMs;
            const segs = drill.stepTargetsMidi.map((m, i) => ({
                startMs: (drill.countdownEndsAt || activeStart) + i * drill.holdMs,
                endMs: (drill.countdownEndsAt || activeStart) + (i + 1) * drill.holdMs,
                midi: m,
            }));
            return {
                segments: segs,
                toleranceCents: drill.tuneWindowCents,
                targetMidi: drill.targetMidi,
                tMs: nowMs,
            };
        }
        return { segments: [], toleranceCents: 25, targetMidi: 69, tMs: nowMs };
    }, [mode, performancePlan, drill, nowMs]);
    return ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }, pointerEvents: "none", children: (0, jsx_runtime_1.jsx)(AutoSize, { children: ({ width, height }) => ((0, jsx_runtime_1.jsx)(GhostGuideCanvas, { width: width, height: height, reading: reading, segments: segments, toleranceCents: toleranceCents, targetMidi: targetMidi, tMs: tMs, msPerPx: msPerPx, semitoneRange: semitoneRange })) }) }));
}
function GhostGuideCanvas({ width, height, reading, segments, toleranceCents, targetMidi, tMs, msPerPx, semitoneRange, }) {
    const centerX = width / 2;
    const viewStartMs = tMs - centerX * msPerPx - 400;
    const viewEndMs = tMs + centerX * msPerPx + 400;
    const midiToY = (midi) => {
        const dy = (targetMidi - midi) / semitoneRange;
        return height * 0.5 + dy * (height * 0.42);
    };
    const bandPx = (toleranceCents / 100) * (height * 0.42) / semitoneRange;
    const targetY = midiToY(targetMidi);
    // User marker (small dot near playhead)
    const userConf = reading?.confidence ?? 0;
    const userHasVoice = !!reading && userConf >= 0.2;
    const userY = userHasVoice ? midiToY(targetMidi + (reading.cents / 100)) : targetY;
    return ((0, jsx_runtime_1.jsxs)(react_native_skia_1.Canvas, { style: { width, height }, children: [(0, jsx_runtime_1.jsx)(react_native_skia_1.RoundedRect, { x: 0, y: targetY - bandPx, width: width, height: bandPx * 2, r: 12, opacity: 0.12, children: (0, jsx_runtime_1.jsx)(react_native_skia_1.LinearGradient, { start: (0, react_native_skia_1.vec)(0, targetY), end: (0, react_native_skia_1.vec)(width, targetY), colors: ['#37F2C6', '#8A5CFF'] }) }), (0, jsx_runtime_1.jsx)(react_native_skia_1.Group, { opacity: 0.22, children: segments
                    .filter((s) => s.endMs >= viewStartMs && s.startMs <= viewEndMs)
                    .map((s, idx) => {
                    const x1 = centerX + (s.startMs - tMs) / msPerPx;
                    const x2 = centerX + (s.endMs - tMs) / msPerPx;
                    const y = midiToY(s.midi);
                    return ((0, jsx_runtime_1.jsx)(react_native_skia_1.RoundedRect, { x: x1, y: y - bandPx, width: Math.max(2, x2 - x1), height: bandPx * 2, r: 10, children: (0, jsx_runtime_1.jsx)(react_native_skia_1.LinearGradient, { start: (0, react_native_skia_1.vec)(x1, y), end: (0, react_native_skia_1.vec)(x2, y), colors: ['#37F2C6', '#8A5CFF'] }) }, `${idx}`));
                }) }), (0, jsx_runtime_1.jsx)(react_native_skia_1.Line, { p1: (0, react_native_skia_1.vec)(centerX, 0), p2: (0, react_native_skia_1.vec)(centerX, height), color: "rgba(255,255,255,0.18)", strokeWidth: 2 }), (0, jsx_runtime_1.jsx)(react_native_skia_1.Rect, { x: centerX - 5, y: userY - 5, width: 10, height: 10, color: userHasVoice ? 'rgba(55,242,198,0.9)' : 'rgba(255,255,255,0.22)' })] }));
}
function pickTargetMidi(segs, tMs) {
    for (const s of segs) {
        if (tMs >= s.startMs && tMs < s.endMs)
            return s.midi;
    }
    return segs.length ? segs[segs.length - 1].midi : null;
}
// Simple layout measurer to avoid adding new deps.
function AutoSize({ children }) {
    const [size, setSize] = react_1.default.useState({ width: 0, height: 0 });
    return ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: { flex: 1 }, onLayout: (e) => {
            const { width, height } = e.nativeEvent.layout;
            if (!width || !height)
                return;
            setSize({ width, height });
        }, children: size.width > 0 && size.height > 0 ? children(size) : null }));
}
