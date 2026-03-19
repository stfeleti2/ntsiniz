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
exports.CelebrationOverlay = CelebrationOverlay;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const ui_1 = require("@/ui");
const useTheme_1 = require("@/theme/useTheme");
const Typography_1 = require("./Typography");
const PopIn_1 = require("./PopIn");
const sfx_1 = require("@/app/audio/sfx");
function CelebrationOverlay({ visible, kind, emoji, title, subtitle, pills, soundEnabled, onDone, }) {
    const t = (0, useTheme_1.useTheme)();
    const show = (0, react_native_reanimated_1.useSharedValue)(0);
    const burst = (0, react_native_reanimated_1.useSharedValue)(0);
    (0, react_1.useEffect)(() => {
        if (!visible)
            return;
        // Haptics (no extra deps). iOS will still provide a basic vibration.
        if (kind === "pb") {
            react_native_1.Vibration.vibrate(react_native_1.Platform.OS === "android" ? [0, 25, 40, 25, 50, 25] : 40);
        }
        else if (kind === "streak") {
            react_native_1.Vibration.vibrate(react_native_1.Platform.OS === "android" ? [0, 20, 30, 20] : 30);
        }
        else {
            react_native_1.Vibration.vibrate(react_native_1.Platform.OS === "android" ? 25 : 20);
        }
        // Optional sound cue (subtle)
        if (soundEnabled) {
            void (0, sfx_1.playSfx)(kind === "pb" ? "pb" : kind === "streak" ? "streak" : "win").catch(() => { });
        }
        // Animate in
        show.value = (0, react_native_reanimated_1.withTiming)(1, { duration: 220, easing: react_native_reanimated_1.Easing.out(react_native_reanimated_1.Easing.quad) });
        burst.value = 0;
        burst.value = (0, react_native_reanimated_1.withSpring)(1, { damping: 14, stiffness: 180 });
        // Auto dismiss (driven from JS timer for reliability)
        const ms = kind === "pb" ? 1800 : 1300;
        show.value = (0, react_native_reanimated_1.withDelay)(ms, (0, react_native_reanimated_1.withTiming)(0, { duration: 220, easing: react_native_reanimated_1.Easing.in(react_native_reanimated_1.Easing.quad) }));
        const timer = setTimeout(() => onDone?.(), ms + 260);
        return () => clearTimeout(timer);
    }, [visible, kind, onDone, show, burst]);
    const overlayStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => ({
        opacity: show.value,
    }));
    const cardStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        const s = (0, react_native_reanimated_1.interpolate)(show.value, [0, 1], [0.88, 1]);
        return {
            transform: [{ scale: s }],
            opacity: show.value,
        };
    });
    if (!visible)
        return null;
    const pillList = (pills ?? []).slice(0, 3);
    return ((0, jsx_runtime_1.jsxs)(react_native_reanimated_1.default.View, { pointerEvents: "none", style: [styles.overlay, overlayStyle], children: [(0, jsx_runtime_1.jsx)(ui_1.Box, { style: [styles.backdrop, { backgroundColor: "rgba(0,0,0,0.55)" }] }), (0, jsx_runtime_1.jsx)(ui_1.Box, { style: styles.confettiWrap, pointerEvents: "none", children: ANGLES.map((a, idx) => ((0, jsx_runtime_1.jsx)(ConfettiDot, { angleDeg: a, burst: burst, color: t.colors.accent }, `${a}-${idx}`))) }), (0, jsx_runtime_1.jsxs)(react_native_reanimated_1.default.View, { style: [styles.card, { backgroundColor: t.colors.card, borderColor: t.colors.line }, cardStyle], children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { style: styles.emoji, preset: "h1", children: emoji }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "h1", style: { textAlign: "center" }, children: title }), subtitle ? ((0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", style: { textAlign: "center", marginTop: 6 }, children: subtitle })) : null, pillList.length ? ((0, jsx_runtime_1.jsx)(ui_1.Box, { style: styles.pills, children: pillList.map((p, idx) => ((0, jsx_runtime_1.jsx)(PopIn_1.PopIn, { enabled: true, delayMs: idx * 110, children: (0, jsx_runtime_1.jsx)(ui_1.Box, { style: [styles.pill, { borderColor: t.colors.line, backgroundColor: "rgba(124,92,255,0.12)" }], children: (0, jsx_runtime_1.jsxs)(Typography_1.Text, { preset: "muted", children: [p.emoji, " ", p.text] }) }) }, `${p.text}-${idx}`))) })) : null] })] }));
}
const ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
function ConfettiDot({ angleDeg, burst, color, }) {
    const r = 92;
    const rad = (angleDeg * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);
    const dotStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        const tt = burst.value;
        const dist = r * tt;
        return {
            opacity: (0, react_native_reanimated_1.interpolate)(tt, [0, 0.15, 1], [0, 1, 0]),
            transform: [
                { translateX: dx * dist },
                { translateY: dy * dist },
                { scale: (0, react_native_reanimated_1.interpolate)(tt, [0, 1], [0.6, 1.2]) },
                { rotate: `${angleDeg}deg` },
            ],
        };
    });
    return (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: [styles.dot, { backgroundColor: color }, dotStyle] });
}
const styles = react_native_1.StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
    },
    backdrop: {
        ...react_native_1.StyleSheet.absoluteFillObject,
    },
    card: {
        width: "86%",
        borderRadius: 22,
        borderWidth: 1,
        paddingVertical: 18,
        paddingHorizontal: 16,
        alignItems: "center",
    },
    emoji: {
        fontSize: 52,
        marginBottom: 4,
    },
    pills: {
        marginTop: 12,
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
    },
    pill: {
        borderWidth: 1,
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    confettiWrap: {
        position: "absolute",
        width: 1,
        height: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    dot: {
        position: "absolute",
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
