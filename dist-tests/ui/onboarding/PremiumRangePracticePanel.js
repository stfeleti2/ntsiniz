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
exports.PremiumRangePracticePanel = PremiumRangePracticePanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const expo_blur_1 = require("expo-blur");
const expo_linear_gradient_1 = require("expo-linear-gradient");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const react_native_gesture_handler_1 = require("react-native-gesture-handler");
const react_native_skia_1 = require("@shopify/react-native-skia");
const Typography_1 = require("@/ui/components/Typography");
const rangeLadder_1 = require("./rangeLadder");
const LADDER_ORDER = rangeLadder_1.RANGE_LADDER_TOP_TO_BOTTOM;
function PremiumRangePracticePanel({ likelyZone, progress, traceValues, phraseChunks, elapsedLabel, totalLabel, onScrub, }) {
    const [chartSize, setChartSize] = (0, react_1.useState)({ width: 0, height: 0 });
    const sliderWidth = (0, react_native_reanimated_1.useSharedValue)(1);
    const scrub = (0, react_native_reanimated_1.useSharedValue)(clamp01(progress));
    const lastScrubSent = (0, react_native_reanimated_1.useSharedValue)(-1);
    const pulse = (0, react_native_reanimated_1.useSharedValue)(0.4);
    (0, react_1.useEffect)(() => {
        scrub.value = (0, react_native_reanimated_1.withTiming)(clamp01(progress), { duration: 220, easing: react_native_reanimated_1.Easing.out(react_native_reanimated_1.Easing.cubic) });
    }, [progress, scrub]);
    (0, react_1.useEffect)(() => {
        pulse.value = (0, react_native_reanimated_1.withRepeat)((0, react_native_reanimated_1.withTiming)(1, { duration: 640, easing: react_native_reanimated_1.Easing.inOut(react_native_reanimated_1.Easing.quad) }), -1, true);
    }, [pulse]);
    const tracePath = (0, react_1.useMemo)(() => {
        if (chartSize.width < 2 || chartSize.height < 2 || traceValues.length < 2)
            return null;
        const path = react_native_skia_1.Skia.Path.Make();
        const top = chartSize.height * 0.16;
        const bottom = chartSize.height * 0.82;
        const count = traceValues.length;
        traceValues.forEach((value, index) => {
            const x = count <= 1 ? 0 : (index / (count - 1)) * chartSize.width;
            const y = bottom - clamp01(value) * (bottom - top);
            if (index === 0)
                path.moveTo(x, y);
            else
                path.lineTo(x, y);
        });
        return path;
    }, [chartSize.height, chartSize.width, traceValues]);
    const onRailLayout = (event) => {
        const { width, height } = event.nativeEvent.layout;
        if (width <= 0 || height <= 0)
            return;
        setChartSize({ width, height });
    };
    const scrubGesture = react_native_gesture_handler_1.Gesture.Pan()
        .onBegin((event) => {
        const width = Math.max(1, sliderWidth.value);
        const next = Math.max(0, Math.min(1, event.x / width));
        scrub.value = next;
        if (onScrub) {
            lastScrubSent.value = next;
            (0, react_native_reanimated_1.runOnJS)(onScrub)(next);
        }
    })
        .onUpdate((event) => {
        const width = Math.max(1, sliderWidth.value);
        const next = Math.max(0, Math.min(1, event.x / width));
        scrub.value = next;
        if (onScrub && Math.abs(next - lastScrubSent.value) >= 0.008) {
            lastScrubSent.value = next;
            (0, react_native_reanimated_1.runOnJS)(onScrub)(next);
        }
    });
    const thumbStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => ({
        transform: [{ translateX: scrub.value * Math.max(1, sliderWidth.value) - 9 }],
    }));
    const fillStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => ({
        width: scrub.value * Math.max(1, sliderWidth.value),
    }));
    const playheadStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => ({
        opacity: 0.44 + pulse.value * 0.42,
    }));
    const activeZone = likelyZone.toLowerCase();
    const zoneIndex = LADDER_ORDER.findIndex((zone) => zone.toLowerCase() === activeZone);
    const topLabel = 'Highest';
    const bottomLabel = 'Lowest';
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.wrap, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.ladderCol, children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", style: styles.ladderTop, children: topLabel }), (0, jsx_runtime_1.jsx)(react_native_skia_1.Canvas, { style: styles.ladderCanvas, children: LADDER_ORDER.map((zone, index) => {
                            const y = (index / (LADDER_ORDER.length - 1)) * 212;
                            const isActive = zone.toLowerCase() === activeZone;
                            const near = zoneIndex >= 0 && Math.abs(index - zoneIndex) <= 1;
                            return ((0, jsx_runtime_1.jsx)(react_native_skia_1.RoundedRect, { x: 0, y: y, width: 18, height: isActive ? 9 : 7, r: 999, color: isActive ? '#83F4D5' : near ? 'rgba(180,165,255,0.66)' : 'rgba(135,120,196,0.42)' }, `ladder-${zone}`));
                        }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.ladderLabels, children: LADDER_ORDER.map((zone) => {
                            const highlighted = zone.toLowerCase() === activeZone;
                            return ((0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "caption", style: { color: highlighted ? '#9FFFE7' : '#AFA4D8', fontWeight: highlighted ? '700' : '500' }, children: zone }, `zone-${zone}`));
                        }) }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", style: styles.ladderBottom, children: bottomLabel })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.railCol, children: [(0, jsx_runtime_1.jsx)(expo_linear_gradient_1.LinearGradient, { colors: ['rgba(116,95,222,0.4)', 'rgba(30,21,71,0.92)', 'rgba(16,15,37,0.96)'], style: styles.railShell, start: { x: 0, y: 0 }, end: { x: 1, y: 1 }, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.railInner, onLayout: onRailLayout, children: [(0, jsx_runtime_1.jsxs)(react_native_skia_1.Canvas, { style: react_native_1.StyleSheet.absoluteFill, children: [(0, jsx_runtime_1.jsx)(react_native_skia_1.Rect, { x: 0, y: 0, width: chartSize.width, height: chartSize.height, color: "rgba(10,8,25,0.56)" }), (0, jsx_runtime_1.jsx)(react_native_skia_1.Group, { opacity: 0.9, children: phraseChunks.map((chunk, index) => {
                                                const count = Math.max(1, phraseChunks.length);
                                                const gap = 8;
                                                const available = Math.max(24, chartSize.width - gap * (count - 1));
                                                const segmentW = available / count;
                                                const x = index * (segmentW + gap);
                                                const y = chartSize.height * (0.44 + (index % 2 === 0 ? -0.04 : 0.02));
                                                const active = clamp01(progress) >= (index + 0.2) / count;
                                                return ((0, jsx_runtime_1.jsx)(react_native_skia_1.RoundedRect, { x: x, y: y, width: Math.max(18, segmentW), height: 10, r: 999, children: (0, jsx_runtime_1.jsx)(react_native_skia_1.LinearGradient, { start: (0, react_native_skia_1.vec)(x, y), end: (0, react_native_skia_1.vec)(x + Math.max(18, segmentW), y), colors: active ? ['#86EFFF', '#BFB0FF'] : ['rgba(170,147,239,0.5)', 'rgba(173,150,236,0.34)'] }) }, `segment-${chunk}-${index}`));
                                            }) }), tracePath ? ((0, jsx_runtime_1.jsx)(react_native_skia_1.Path, { path: tracePath, color: "#91F9E8", style: "stroke", strokeWidth: 4, strokeJoin: "round", strokeCap: "round" })) : null, (0, jsx_runtime_1.jsx)(react_native_skia_1.Line, { p1: (0, react_native_skia_1.vec)(chartSize.width / 2, 0), p2: (0, react_native_skia_1.vec)(chartSize.width / 2, chartSize.height), color: "rgba(124,245,255,0.95)", strokeWidth: 2 }), (0, jsx_runtime_1.jsx)(react_native_skia_1.Circle, { cx: chartSize.width / 2, cy: chartSize.height * 0.5, r: 6, color: "rgba(155,255,241,0.92)" })] }), (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { pointerEvents: "none", style: [styles.playheadGlow, playheadStyle] })] }) }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.timeRow, children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", children: elapsedLabel }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", children: totalLabel })] }), (0, jsx_runtime_1.jsx)(react_native_gesture_handler_1.GestureDetector, { gesture: scrubGesture, children: (0, jsx_runtime_1.jsxs)(expo_blur_1.BlurView, { intensity: 40, tint: "dark", onLayout: (event) => {
                                sliderWidth.value = Math.max(1, event.nativeEvent.layout.width);
                            }, style: styles.scrubTrack, children: [(0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: [styles.scrubFill, fillStyle] }), (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: [styles.scrubThumb, thumbStyle] })] }) })] })] }));
}
function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}
const styles = react_native_1.StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'stretch',
    },
    ladderCol: {
        width: 94,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(191,181,246,0.34)',
        backgroundColor: 'rgba(23,18,45,0.88)',
        paddingVertical: 8,
        paddingHorizontal: 8,
        alignItems: 'center',
        shadowColor: '#04040E',
        shadowOpacity: 0.4,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
    },
    ladderTop: { alignSelf: 'stretch', textAlign: 'left', fontSize: 11 },
    ladderBottom: { alignSelf: 'stretch', textAlign: 'left', fontSize: 11 },
    ladderCanvas: { width: 18, height: 220, marginTop: 6, marginBottom: 8 },
    ladderLabels: { position: 'absolute', left: 34, top: 22, bottom: 22, justifyContent: 'space-between' },
    railCol: { flex: 1, gap: 8 },
    railShell: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(196,186,255,0.4)',
        padding: 10,
        shadowColor: '#07040F',
        shadowOpacity: 0.42,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 12 },
        elevation: 5,
    },
    railInner: {
        height: 168,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(169,151,236,0.28)',
        backgroundColor: 'rgba(13,11,29,0.84)',
    },
    playheadGlow: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 12,
        left: '50%',
        marginLeft: -6,
        backgroundColor: 'rgba(122,245,255,0.25)',
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    scrubTrack: {
        height: 22,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(202,192,255,0.38)',
        overflow: 'hidden',
        justifyContent: 'center',
        backgroundColor: 'rgba(21,17,42,0.6)',
    },
    scrubFill: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(150,133,255,0.56)',
    },
    scrubThumb: {
        position: 'absolute',
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#DDF4FF',
        borderWidth: 1,
        borderColor: 'rgba(178,162,245,0.66)',
        top: 1.5,
        shadowColor: '#95E5FF',
        shadowOpacity: 0.44,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
});
