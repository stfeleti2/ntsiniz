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
exports.SparkleBurst = SparkleBurst;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const useTheme_1 = require("@/theme/useTheme");
const useQuality_1 = require("@/ui/quality/useQuality");
/** Tiny “sparkle” burst for score improvements. */
function SparkleBurst({ triggerKey, enabled, }) {
    const t = (0, useTheme_1.useTheme)();
    const q = (0, useQuality_1.useQuality)();
    if (!enabled)
        return null;
    const sparkles = q.mode === 'LITE' ? SPARKLES.slice(0, 3) : q.mode === 'BALANCED' ? SPARKLES : SPARKLES_HIGH;
    return ((0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { pointerEvents: "none", style: styles.wrap, children: sparkles.map((s, i) => ((0, jsx_runtime_1.jsx)(Sparkle, { triggerKey: triggerKey, delay: i * 35, x: s.x, y: s.y, color: t.colors.accent, duration: Math.round(650 * q.animationScale) }, i))) }));
}
const SPARKLES = [
    { x: -18, y: -10 },
    { x: 18, y: -12 },
    { x: -22, y: 10 },
    { x: 22, y: 12 },
    { x: 0, y: -22 },
];
const SPARKLES_HIGH = [
    ...SPARKLES,
    { x: -8, y: -26 },
    { x: 10, y: -24 },
    { x: -28, y: -2 },
    { x: 28, y: 2 },
];
function Sparkle({ triggerKey, delay, x, y, color, duration, }) {
    const local = (0, react_native_reanimated_1.useSharedValue)(0);
    (0, react_1.useEffect)(() => {
        local.value = 0;
        local.value = (0, react_native_reanimated_1.withDelay)(delay, (0, react_native_reanimated_1.withTiming)(1, { duration }));
    }, [delay, local, triggerKey]);
    const st = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        const tt = local.value;
        const opacity = (0, react_native_reanimated_1.interpolate)(tt, [0, 0.15, 0.8, 1], [0, 1, 1, 0]);
        const s = (0, react_native_reanimated_1.interpolate)(tt, [0, 0.25, 1], [0.6, 1.05, 0.9]);
        const dx = x * (0, react_native_reanimated_1.interpolate)(tt, [0, 1], [0.2, 1]);
        const dy = y * (0, react_native_reanimated_1.interpolate)(tt, [0, 1], [0.2, 1]);
        return {
            opacity,
            transform: [{ translateX: dx }, { translateY: dy }, { scale: s }],
        };
    });
    return (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.Text, { style: [styles.sparkle, { color }, st], children: "\u2726" });
}
const styles = react_native_1.StyleSheet.create({
    wrap: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    sparkle: {
        position: "absolute",
        fontSize: 14,
    },
});
