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
exports.Screen = Screen;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const expo_linear_gradient_1 = require("expo-linear-gradient");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const theme_1 = require("@/ui/theme");
const primitives_1 = require("@/ui/primitives");
const i18n_1 = require("@/core/i18n");
function Screen({ children, scroll = false, style, background = "plain", title, subtitle, onBack }) {
    const t = (0, theme_1.useTheme)();
    const { width } = (0, react_native_1.useWindowDimensions)();
    const layout = (0, react_1.useMemo)(() => {
        if (width >= t.breakpoints.tabletLg)
            return { paddingHorizontal: 34, paddingVertical: 22, gap: 18 };
        if (width >= t.breakpoints.tablet)
            return { paddingHorizontal: 26, paddingVertical: 20, gap: 16 };
        return { paddingHorizontal: 16, paddingVertical: 16, gap: 14 };
    }, [width, t.breakpoints.tablet, t.breakpoints.tabletLg]);
    const Shell = ({ children: inner }) => {
        if (background === "plain") {
            return (0, jsx_runtime_1.jsx)(react_native_safe_area_context_1.SafeAreaView, { style: [styles.safe, { backgroundColor: t.colors.bg }], children: inner });
        }
        const colors = background === "hero"
            ? [t.colors.bg, '#13112A', '#201A41', '#131125', t.colors.bg]
            : [t.colors.bg, '#10182F', '#121A32', t.colors.bg];
        return ((0, jsx_runtime_1.jsxs)(react_native_safe_area_context_1.SafeAreaView, { style: [styles.safe, { backgroundColor: t.colors.bg }], children: [(0, jsx_runtime_1.jsx)(expo_linear_gradient_1.LinearGradient, { colors: colors, style: react_native_1.StyleSheet.absoluteFill, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }), (0, jsx_runtime_1.jsx)(Backdrop, { variant: background }), inner] }));
    };
    const header = title ? ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { gap: 6 }, children: [(0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "xl", weight: "bold", children: title }), onBack ? ((0, jsx_runtime_1.jsx)(primitives_1.Pressable, { onPress: onBack, accessibilityRole: "button", style: { paddingVertical: 4, paddingHorizontal: 8 }, children: (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: (0, i18n_1.t)('common.back', 'Back') }) })) : null] }), subtitle ? (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: subtitle }) : null] })) : null;
    if (scroll) {
        return ((0, jsx_runtime_1.jsx)(Shell, { children: (0, jsx_runtime_1.jsxs)(react_native_1.ScrollView, { contentContainerStyle: [styles.container, layout, style], showsVerticalScrollIndicator: false, children: [header, children] }) }));
    }
    return ((0, jsx_runtime_1.jsx)(Shell, { children: (0, jsx_runtime_1.jsxs)(react_native_reanimated_1.default.View, { style: [styles.container, layout, style], children: [header, children] }) }));
}
function Backdrop({ variant }) {
    const p1 = (0, react_native_reanimated_1.useSharedValue)(0);
    const p2 = (0, react_native_reanimated_1.useSharedValue)(0);
    const p3 = (0, react_native_reanimated_1.useSharedValue)(0);
    (0, react_1.useEffect)(() => {
        const ease = react_native_reanimated_1.Easing.inOut(react_native_reanimated_1.Easing.quad);
        p1.value = (0, react_native_reanimated_1.withRepeat)((0, react_native_reanimated_1.withTiming)(1, { duration: 5400, easing: ease }), -1, true);
        p2.value = (0, react_native_reanimated_1.withRepeat)((0, react_native_reanimated_1.withTiming)(1, { duration: 6800, easing: ease }), -1, true);
        p3.value = (0, react_native_reanimated_1.withRepeat)((0, react_native_reanimated_1.withTiming)(1, { duration: 7600, easing: ease }), -1, true);
    }, [p1, p2, p3]);
    const a1 = (0, react_native_reanimated_1.useAnimatedStyle)(() => ({
        transform: [{ translateX: (p1.value - 0.5) * 22 }, { translateY: (p1.value - 0.5) * 14 }, { rotate: "15deg" }],
    }));
    const a2 = (0, react_native_reanimated_1.useAnimatedStyle)(() => ({
        transform: [{ translateX: (p2.value - 0.5) * -18 }, { translateY: (p2.value - 0.5) * 18 }, { rotate: "-10deg" }],
    }));
    const a3 = (0, react_native_reanimated_1.useAnimatedStyle)(() => ({
        transform: [{ translateX: (p3.value - 0.5) * 16 }, { translateY: (p3.value - 0.5) * -16 }, { rotate: "20deg" }],
    }));
    const accent = "rgba(122, 107, 255, 0.30)";
    const pink = "rgba(236, 166, 255, 0.16)";
    const cyan = "rgba(137, 233, 255, 0.18)";
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { pointerEvents: "none", style: [
                    styles.blob,
                    {
                        width: 340,
                        height: 340,
                        top: -140,
                        left: -120,
                        backgroundColor: accent,
                        opacity: variant === "hero" ? 0.92 : 0.7,
                    },
                    a1,
                ] }), (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { pointerEvents: "none", style: [
                    styles.blob,
                    {
                        width: 260,
                        height: 260,
                        bottom: -140,
                        right: -120,
                        backgroundColor: pink,
                        opacity: 0.6,
                    },
                    a2,
                ] }), variant === "hero" ? ((0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { pointerEvents: "none", style: [
                    styles.blob,
                    {
                        width: 220,
                        height: 220,
                        top: 124,
                        right: -84,
                        backgroundColor: cyan,
                        opacity: 0.62,
                    },
                    a3,
                ] })) : null] }));
}
const styles = react_native_1.StyleSheet.create({
    safe: { flex: 1 },
    container: { flexGrow: 1 },
    blob: {
        position: "absolute",
        borderRadius: 999,
        shadowColor: '#8E89FF',
        shadowOpacity: 0.34,
        shadowRadius: 42,
        shadowOffset: { width: 0, height: 18 },
    },
});
