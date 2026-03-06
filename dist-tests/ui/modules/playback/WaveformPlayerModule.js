"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaveformPlayerModule = WaveformPlayerModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("@/ui/primitives");
const Button_1 = require("@/ui/components/Button");
const patterns_1 = require("@/ui/patterns");
const i18n_1 = require("@/app/i18n");
/**
 * Playback UI block: waveform + progress + controls.
 * Pure UI (no audio business logic). Wire it in screens/controllers.
 */
function WaveformPlayerModule({ peaks, loading, progress, progressLabel, isPlaying, onToggle, onRestart, onSeek, disabled, height = 110, testID, style, }) {
    const canSeek = !disabled && typeof onSeek === 'function';
    const canToggle = !disabled && typeof onToggle === 'function';
    const canRestart = !disabled && typeof onRestart === 'function';
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { testID: testID, style: style, children: [loading && (!peaks || !peaks.length) ? ((0, jsx_runtime_1.jsx)(patterns_1.WaveformSkeleton, { bars: Math.max(24, Math.min(120, peaks?.length || 96)), height: height, testID: testID ? `${testID}.loading` : undefined })) : ((0, jsx_runtime_1.jsx)(patterns_1.WaveformSeek, { peaks: peaks, progress: progress, onSeek: canSeek ? onSeek : undefined, disabled: !canSeek, height: height, testID: testID ? `${testID}.waveform` : undefined })), (0, jsx_runtime_1.jsx)(primitives_1.Box, { style: { height: 10 } }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", children: progressLabel }), (0, jsx_runtime_1.jsx)(primitives_1.Box, { style: { height: 12 } }), (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { direction: "horizontal", gap: 10, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { text: isPlaying ? (0, i18n_1.t)('common.pause') : (0, i18n_1.t)('common.play'), variant: "primary", onPress: canToggle ? onToggle : undefined, testID: testID ? `${testID}.toggle` : undefined }), (0, jsx_runtime_1.jsx)(Button_1.Button, { text: (0, i18n_1.t)('playback.restart'), variant: "secondary", onPress: canRestart ? onRestart : undefined, testID: testID ? `${testID}.restart` : undefined })] })] }));
}
