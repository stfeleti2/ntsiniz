"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttemptRowModule = AttemptRowModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("@/ui/primitives");
const patterns_1 = require("@/ui/patterns");
const i18n_1 = require("@/app/i18n");
const useSoundPlayback_1 = require("@/app/audio/useSoundPlayback");
const useWaveformData_1 = require("@/app/audio/useWaveformData");
const kit_1 = require("@/ui/components/kit");
/**
 * UI-only row module for an Attempt.
 * Can optionally wire PlaybackOverlay in dev if a URI is provided.
 */
function AttemptRowModule({ attempt, index, isBest, drillTitleById, livePlayback, getAudioUri, onOpenAttempt, parentTestID, showDivider, }) {
    const title = drillTitleById ? drillTitleById(attempt.drillId) : attempt.drillId;
    const scoreLabel = (0, i18n_1.t)('results.scoreChip', { score: Math.round(attempt.score) });
    const dateLabel = new Date(attempt.createdAt).toLocaleDateString();
    const metricsUri = attempt?.metrics?.audioUri;
    const resolvedUri = (getAudioUri ? getAudioUri(attempt) : metricsUri) ?? null;
    const uri = resolvedUri && (livePlayback || !!metricsUri) ? resolvedUri : metricsUri ?? null;
    const pb = (0, useSoundPlayback_1.useSoundPlayback)(uri);
    const wf = (0, useWaveformData_1.useWaveformData)({ uri, metrics: attempt?.metrics, bars: 72 });
    const peaks = wf.data?.waveformPeaks ?? [];
    const canSeek = !!uri && pb.isReady && typeof pb.seekToProgress === 'function';
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { children: [(0, jsx_runtime_1.jsxs)(patterns_1.WaveformCard, { testID: parentTestID ? `${parentTestID}.item.${index}` : undefined, title: title, subtitle: (0, i18n_1.t)('results.attemptMeta', { date: dateLabel }), statusLabel: scoreLabel, rightSlot: (0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { flexDirection: 'row', alignItems: 'center', gap: 8 }, children: [isBest ? (0, jsx_runtime_1.jsx)(patterns_1.TakeBadge, { status: "best" }) : null, onOpenAttempt ? ((0, jsx_runtime_1.jsx)(kit_1.IconButton, { icon: "open", accessibilityLabel: (0, i18n_1.t)('results.openPlayback'), onPress: () => onOpenAttempt(attempt), testID: parentTestID ? `${parentTestID}.item.${index}.open` : undefined, size: 36 })) : null] }), contentHeight: 110, children: [uri ? (wf.loading && !peaks.length ? ((0, jsx_runtime_1.jsx)(patterns_1.WaveformSkeleton, { bars: 72, height: 82, testID: parentTestID ? `${parentTestID}.item.${index}.waveform.loading` : undefined, style: { marginTop: 2 } })) : ((0, jsx_runtime_1.jsx)(patterns_1.WaveformSeek, { peaks: peaks, progress: pb.progress, onSeek: canSeek ? pb.seekToProgress : undefined, disabled: !canSeek, testID: parentTestID ? `${parentTestID}.item.${index}.waveform` : undefined, height: 82, style: { marginTop: 2 } }))) : ((0, jsx_runtime_1.jsx)(primitives_1.Box, { style: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }, children: (0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", size: "sm", children: (0, i18n_1.t)('results.noAudio') }) })), (0, jsx_runtime_1.jsx)(patterns_1.PlaybackOverlay, { isPlaying: uri ? pb.isPlaying : false, progressLabel: uri ? pb.progressLabel : (0, i18n_1.t)('results.playbackUnavailable'), onToggle: uri && pb.isReady ? pb.toggle : undefined })] }), showDivider ? (0, jsx_runtime_1.jsx)(primitives_1.Divider, {}) : null] }));
}
