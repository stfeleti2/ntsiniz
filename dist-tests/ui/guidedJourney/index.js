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
exports.GhostGuideOverlay = void 0;
exports.BrandWorldBackdrop = BrandWorldBackdrop;
exports.HexagonHero = HexagonHero;
exports.HexagonStateRenderer = HexagonStateRenderer;
exports.StatusPill = StatusPill;
exports.StatusIcon = StatusIcon;
exports.ChoiceCardGroup = ChoiceCardGroup;
exports.TrustBulletRow = TrustBulletRow;
exports.PrimaryActionBar = PrimaryActionBar;
exports.VoiceGuideCard = VoiceGuideCard;
exports.CoachInset = CoachInset;
exports.DemoLoopCard = DemoLoopCard;
exports.TechniqueVisualCard = TechniqueVisualCard;
exports.AdaptiveInstructionBlock = AdaptiveInstructionBlock;
exports.LivePitchTrace = LivePitchTrace;
exports.TargetRail = TargetRail;
exports.RangeRail = RangeRail;
exports.CurrentZoneChip = CurrentZoneChip;
exports.StabilityMeter = StabilityMeter;
exports.EnvironmentChip = EnvironmentChip;
exports.ConfidenceIndicator = ConfidenceIndicator;
exports.RewardBurst = RewardBurst;
exports.StartingProfileCard = StartingProfileCard;
exports.VoiceSnapshotCard = VoiceSnapshotCard;
exports.ResultAnnotationCard = ResultAnnotationCard;
exports.PlaybackInsightCard = PlaybackInsightCard;
exports.NextStepCard = NextStepCard;
exports.JourneyPath = JourneyPath;
exports.MilestoneCard = MilestoneCard;
exports.ChapterHeroCard = ChapterHeroCard;
exports.InlineRecoveryCard = InlineRecoveryCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const expo_linear_gradient_1 = require("expo-linear-gradient");
const react_native_svg_1 = __importStar(require("react-native-svg"));
const primitives_1 = require("@/ui/primitives");
const Card_1 = require("@/ui/components/Card");
const Button_1 = require("@/ui/components/Button");
const SparkleBurst_1 = require("@/ui/components/SparkleBurst");
const ghost_1 = require("@/ui/ghost");
Object.defineProperty(exports, "GhostGuideOverlay", { enumerable: true, get: function () { return ghost_1.GhostGuideOverlay; } });
const stateMeta = {
    idle: { glow: 'rgba(132, 104, 255, 0.22)', border: '#9D8CFF', label: 'Idle' },
    ready: { glow: 'rgba(156, 133, 255, 0.30)', border: '#C8BCFF', label: 'Ready' },
    listening: { glow: 'rgba(115, 201, 255, 0.28)', border: '#7FD8FF', label: 'Listening' },
    voiceDetected: { glow: 'rgba(118, 255, 190, 0.30)', border: '#79F0C7', label: 'Voice detected' },
    tracking: { glow: 'rgba(139, 191, 255, 0.28)', border: '#8FB8FF', label: 'Tracking' },
    locked: { glow: 'rgba(255, 216, 125, 0.28)', border: '#FFD472', label: 'Locked' },
    unstable: { glow: 'rgba(255, 141, 186, 0.26)', border: '#FF9AC7', label: 'Unstable' },
    success: { glow: 'rgba(125, 255, 179, 0.34)', border: '#76F7A6', label: 'Success' },
    needsRetry: { glow: 'rgba(255, 168, 99, 0.28)', border: '#FFB474', label: 'Retry' },
    paused: { glow: 'rgba(176, 178, 208, 0.22)', border: '#C4C8DF', label: 'Paused' },
};
const UI_STRINGS = {
    demoPill: 'Demo',
    techniquePill: 'Technique',
    target: 'Target',
    stability: 'Stability',
    confidence: 'Confidence',
    current: 'Current',
    locked: 'Locked',
    open: 'Open',
    recovery: 'Recovery',
};
function BrandWorldBackdrop({ children }) {
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: react_native_1.StyleSheet.absoluteFill, pointerEvents: "none", children: [(0, jsx_runtime_1.jsx)(expo_linear_gradient_1.LinearGradient, { colors: ['#080714', '#1A1034', '#29134E', '#0D0A16'], style: react_native_1.StyleSheet.absoluteFill, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.orb, styles.orbLeft] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.orb, styles.orbRight] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.orb, styles.orbBottom] }), children] }));
}
function HexagonHero({ state = 'idle', size = 220, title, subtitle, progress = 0.5, }) {
    const meta = stateMeta[state];
    const points = hexagonPath(size);
    const innerPoints = hexagonPath(size * 0.72);
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { alignItems: 'center', justifyContent: 'center', gap: 10 }, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: meta.glow,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: meta.border,
                    shadowOpacity: 0.38,
                    shadowRadius: 26,
                    shadowOffset: { width: 0, height: 14 },
                }, children: (0, jsx_runtime_1.jsxs)(react_native_svg_1.default, { width: size, height: size, viewBox: `0 0 ${size} ${size}`, children: [(0, jsx_runtime_1.jsxs)(react_native_svg_1.Defs, { children: [(0, jsx_runtime_1.jsxs)(react_native_svg_1.LinearGradient, { id: "hexGlow", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [(0, jsx_runtime_1.jsx)(react_native_svg_1.Stop, { offset: "0%", stopColor: "#F7F2FF", stopOpacity: "0.92" }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Stop, { offset: "55%", stopColor: meta.border, stopOpacity: "0.88" }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Stop, { offset: "100%", stopColor: "#5F44CF", stopOpacity: "0.8" })] }), (0, jsx_runtime_1.jsxs)(react_native_svg_1.LinearGradient, { id: "hexInner", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [(0, jsx_runtime_1.jsx)(react_native_svg_1.Stop, { offset: "0%", stopColor: "rgba(255,255,255,0.28)" }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Stop, { offset: "100%", stopColor: "rgba(255,255,255,0.04)" })] })] }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: points, fill: "rgba(17, 11, 37, 0.78)", stroke: "url(#hexGlow)", strokeWidth: 4 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: innerPoints, fill: "url(#hexInner)", stroke: "rgba(255,255,255,0.18)", strokeWidth: 2 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Circle, { cx: size / 2, cy: size / 2, r: size * 0.12, fill: meta.border, opacity: 0.55 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Circle, { cx: size / 2, cy: size / 2, r: size * 0.22, fill: "none", stroke: "rgba(255,255,255,0.14)", strokeWidth: size * 0.06 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Circle, { cx: size / 2, cy: size / 2, r: size * 0.22, fill: "none", stroke: meta.border, strokeWidth: size * 0.045, strokeDasharray: `${Math.max(12, progress * 180)} ${Math.max(20, 220 - progress * 180)}`, strokeLinecap: "round", transform: `rotate(-90 ${size / 2} ${size / 2})` })] }) }), title ? (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "lg", weight: "bold", children: title }) : null, subtitle ? (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", style: { textAlign: 'center' }, children: subtitle }) : null] }));
}
function HexagonStateRenderer(props) {
    return (0, jsx_runtime_1.jsx)(HexagonHero, { ...props });
}
function StatusPill({ state, label }) {
    const actual = state in stateMeta ? state : state === 'blocked' ? 'paused' : state === 'noisy' ? 'unstable' : 'needsRetry';
    const meta = stateMeta[actual];
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: {
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 999,
            backgroundColor: meta.glow,
            borderWidth: 1,
            borderColor: meta.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        }, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { children: statusGlyph(state) }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", weight: "semibold", children: label ?? meta.label })] }));
}
function StatusIcon({ state }) {
    return (0, jsx_runtime_1.jsx)(primitives_1.Text, { children: statusGlyph(state) });
}
function ChoiceCardGroup({ title, value, options, onChange, }) {
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { gap: 10 }, children: [title ? (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "lg", weight: "bold", children: title }) : null, options.map((option) => {
                const selected = option.id === value;
                return ((0, jsx_runtime_1.jsx)(Card_1.Card, { tone: selected ? 'glow' : 'default', style: { padding: 0, overflow: 'hidden' }, children: (0, jsx_runtime_1.jsxs)(primitives_1.Pressable, { onPress: () => onChange(option.id), style: {
                            padding: 16,
                            gap: 6,
                            borderWidth: selected ? 1 : 0,
                            borderColor: selected ? 'rgba(220, 212, 255, 0.42)' : 'transparent',
                        }, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "md", weight: "bold", children: option.title }), option.subtitle ? (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: option.subtitle }) : null] }) }, option.id));
            })] }));
}
function TrustBulletRow({ bullets }) {
    return ((0, jsx_runtime_1.jsx)(primitives_1.Box, { style: { gap: 8 }, children: bullets.map((bullet, idx) => ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' }, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { children: idx === 0 ? '🔒' : idx === 1 ? '🎙️' : '✨' }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", style: { flex: 1 }, children: bullet })] }, `${bullet}-${idx}`))) }));
}
function PrimaryActionBar({ primaryLabel, onPrimary, secondaryLabel, onSecondary, helperText, }) {
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { tone: "glow", children: (0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { gap: 10 }, children: [helperText ? (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: helperText }) : null, (0, jsx_runtime_1.jsx)(Button_1.Button, { text: primaryLabel, onPress: onPrimary }), secondaryLabel && onSecondary ? (0, jsx_runtime_1.jsx)(Button_1.Button, { text: secondaryLabel, variant: "ghost", onPress: onSecondary }) : null] }) }));
}
function VoiceGuideCard({ title, body, pill }) {
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { tone: "glow", children: (0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { gap: 8 }, children: [pill ? (0, jsx_runtime_1.jsx)(StatusPill, { state: "ready", label: pill }) : null, (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "lg", weight: "bold", children: title }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: body })] }) }));
}
function CoachInset({ title, body }) {
    return ((0, jsx_runtime_1.jsxs)(Card_1.Card, { tone: "elevated", children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "md", weight: "bold", children: title }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: body })] }));
}
function DemoLoopCard({ title, body }) {
    return (0, jsx_runtime_1.jsx)(VoiceGuideCard, { title: title, body: body, pill: UI_STRINGS.demoPill });
}
function TechniqueVisualCard({ title, body }) {
    return (0, jsx_runtime_1.jsx)(VoiceGuideCard, { title: title, body: body, pill: UI_STRINGS.techniquePill });
}
function AdaptiveInstructionBlock({ title, body, state }) {
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { tone: "elevated", children: (0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { gap: 8 }, children: [(0, jsx_runtime_1.jsx)(StatusPill, { state: state ?? 'tracking' }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "md", weight: "bold", children: title }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: body })] }) }));
}
function LivePitchTrace({ values, color = '#C8BCFF' }) {
    const safe = values.length ? values : [0.5, 0.52, 0.48];
    const points = safe
        .slice(-32)
        .map((value, index, list) => `${(index / Math.max(1, list.length - 1)) * 220},${60 - clampValue(value, 0, 1) * 50}`)
        .join(' ');
    return ((0, jsx_runtime_1.jsx)(react_native_svg_1.default, { width: 220, height: 64, children: (0, jsx_runtime_1.jsx)(react_native_svg_1.Polyline, { points: points, fill: "none", stroke: color, strokeWidth: 3, strokeLinecap: "round" }) }));
}
function TargetRail({ progress }) {
    return (0, jsx_runtime_1.jsx)(MeterBar, { label: UI_STRINGS.target, value: progress, color: "#C8BCFF" });
}
function RangeRail({ minLabel, maxLabel, progress }) {
    return (0, jsx_runtime_1.jsx)(MeterBar, { label: `${minLabel} → ${maxLabel}`, value: progress, color: "#76F7A6" });
}
function CurrentZoneChip({ label }) {
    return (0, jsx_runtime_1.jsx)(StatusPill, { state: "tracking", label: label });
}
function StabilityMeter({ value }) {
    return (0, jsx_runtime_1.jsx)(MeterBar, { label: UI_STRINGS.stability, value: 1 - clampValue(value / 30, 0, 1), color: "#7FD8FF" });
}
function EnvironmentChip({ state, label }) {
    return (0, jsx_runtime_1.jsx)(StatusPill, { state: state, label: label });
}
function ConfidenceIndicator({ value }) {
    return (0, jsx_runtime_1.jsx)(MeterBar, { label: UI_STRINGS.confidence, value: value, color: "#FFD472" });
}
function RewardBurst({ active }) {
    return (0, jsx_runtime_1.jsx)(SparkleBurst_1.SparkleBurst, { enabled: active, triggerKey: active ? 'reward-burst-active' : 'reward-burst-idle' });
}
function StartingProfileCard({ title, body, items }) {
    return (0, jsx_runtime_1.jsx)(InfoCard, { title: title, body: body, items: items });
}
function VoiceSnapshotCard({ title, body, items }) {
    return (0, jsx_runtime_1.jsx)(InfoCard, { title: title, body: body, items: items });
}
function ResultAnnotationCard({ title, body }) {
    return (0, jsx_runtime_1.jsx)(InfoCard, { title: title, body: body, items: [] });
}
function PlaybackInsightCard({ title, body }) {
    return (0, jsx_runtime_1.jsx)(InfoCard, { title: title, body: body, items: [] });
}
function NextStepCard({ title, body, cta, onPress }) {
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { tone: "glow", children: (0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { gap: 8 }, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "lg", weight: "bold", children: title }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: body }), (0, jsx_runtime_1.jsx)(Button_1.Button, { text: cta, onPress: onPress })] }) }));
}
function JourneyPath({ items, activeId, lockedIds = [], }) {
    return ((0, jsx_runtime_1.jsx)(primitives_1.Box, { style: { gap: 10 }, children: items.map((item, index) => {
            const active = item.id === activeId;
            const locked = lockedIds.includes(item.id);
            return ((0, jsx_runtime_1.jsx)(Card_1.Card, { tone: active ? 'glow' : 'default', children: (0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { flexDirection: 'row', alignItems: 'center', gap: 12 }, children: [(0, jsx_runtime_1.jsx)(primitives_1.Box, { style: {
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: active ? 'rgba(200,188,255,0.24)' : 'rgba(255,255,255,0.08)',
                            }, children: (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", weight: "bold", children: locked ? '🔒' : index + 1 }) }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "md", weight: "bold", style: { flex: 1 }, children: item.title }), active ? (0, jsx_runtime_1.jsx)(StatusPill, { state: "ready", label: UI_STRINGS.current }) : locked ? (0, jsx_runtime_1.jsx)(StatusPill, { state: "blocked", label: UI_STRINGS.locked }) : (0, jsx_runtime_1.jsx)(StatusPill, { state: "success", label: UI_STRINGS.open })] }) }, item.id));
        }) }));
}
function MilestoneCard({ title, body, stat }) {
    return ((0, jsx_runtime_1.jsxs)(Card_1.Card, { tone: "elevated", children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: title }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "xl", weight: "bold", children: stat }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: body })] }));
}
function ChapterHeroCard({ title, subtitle, stageLabel, cta, onPress, }) {
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { tone: "glow", children: (0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { gap: 10 }, children: [(0, jsx_runtime_1.jsx)(StatusPill, { state: "ready", label: stageLabel }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "xl", weight: "bold", children: title }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: subtitle }), cta && onPress ? (0, jsx_runtime_1.jsx)(Button_1.Button, { text: cta, onPress: onPress }) : null] }) }));
}
function InlineRecoveryCard({ title, body, action, onPress, }) {
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { tone: "warning", children: (0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { gap: 8 }, children: [(0, jsx_runtime_1.jsx)(StatusPill, { state: "needsRetry", label: UI_STRINGS.recovery }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "lg", weight: "bold", children: title }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: body }), (0, jsx_runtime_1.jsx)(Button_1.Button, { text: action, onPress: onPress })] }) }));
}
function MeterBar({ label, value, color }) {
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { gap: 6 }, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: label }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.meterTrack, children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.meterFill, { width: `${Math.max(6, clampValue(value, 0, 1) * 100)}%`, backgroundColor: color }] }) })] }));
}
function InfoCard({ title, body, items }) {
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { tone: "elevated", children: (0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { gap: 8 }, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "lg", weight: "bold", children: title }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: body }), items.map((item, index) => ((0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: `• ${item}` }, `${item}-${index}`)))] }) }));
}
function statusGlyph(state) {
    switch (state) {
        case 'ready':
            return '●';
        case 'listening':
            return '◉';
        case 'noisy':
            return '≈';
        case 'locked':
            return '◆';
        case 'success':
            return '✓';
        case 'needsRetry':
        case 'retry':
            return '↺';
        case 'paused':
        case 'blocked':
            return 'Ⅱ';
        case 'voiceDetected':
            return '◌';
        case 'tracking':
            return '▵';
        case 'unstable':
            return '!';
        default:
            return '○';
    }
}
function clampValue(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function hexagonPath(size) {
    const center = size / 2;
    const radius = size / 2 - 10;
    const points = Array.from({ length: 6 }, (_, index) => {
        const angle = (Math.PI / 3) * index - Math.PI / 6;
        return [center + radius * Math.cos(angle), center + radius * Math.sin(angle)];
    });
    return `M ${points.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`;
}
const styles = react_native_1.StyleSheet.create({
    orb: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(177, 151, 255, 0.16)',
    },
    orbLeft: {
        width: 260,
        height: 260,
        left: -80,
        top: -30,
    },
    orbRight: {
        width: 220,
        height: 220,
        right: -60,
        top: 120,
        backgroundColor: 'rgba(104, 201, 255, 0.14)',
    },
    orbBottom: {
        width: 300,
        height: 300,
        bottom: -140,
        left: 40,
        backgroundColor: 'rgba(255, 158, 220, 0.12)',
    },
    meterTrack: {
        height: 10,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.10)',
        overflow: 'hidden',
    },
    meterFill: {
        height: '100%',
        borderRadius: 999,
    },
});
