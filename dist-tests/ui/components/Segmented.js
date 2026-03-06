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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Segmented = Segmented;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const expo_linear_gradient_1 = require("expo-linear-gradient");
const useTheme_1 = require("@/theme/useTheme");
const Typography_1 = require("./Typography");
const ui_1 = require("@/ui");
const AnimatedGradient = react_native_reanimated_1.default.createAnimatedComponent(expo_linear_gradient_1.LinearGradient);
function Segmented({ value, options, onChange, testIDPrefix }) {
    const t = (0, useTheme_1.useTheme)();
    const idx = Math.max(0, options.findIndex((o) => o.key === value));
    const x = (0, react_native_reanimated_1.useSharedValue)(idx);
    react_1.default.useEffect(() => {
        x.value = (0, react_native_reanimated_1.withSpring)(idx, { damping: 16, stiffness: 180 });
    }, [idx, x]);
    const indicator = (0, react_native_reanimated_1.useAnimatedStyle)(() => ({ transform: [{ translateX: x.value * 120 }] }));
    return ((0, jsx_runtime_1.jsxs)(ui_1.Box, { style: [styles.wrap, { borderColor: t.colors.line, backgroundColor: "rgba(255,255,255,0.06)" }], children: [(0, jsx_runtime_1.jsx)(AnimatedGradient, { colors: t.gradients.primary, start: { x: 0, y: 0 }, end: { x: 1, y: 1 }, style: [styles.indicator, { borderColor: "rgba(255,255,255,0.18)" }, indicator] }), options.map((o) => {
                const active = o.key === value;
                return ((0, jsx_runtime_1.jsx)(ui_1.Pressable, { style: styles.item, accessibilityRole: "button", accessibilityLabel: o.label, onPress: () => onChange(o.key), testID: testIDPrefix ? `${testIDPrefix}-${o.key}` : undefined, children: (0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: active ? "body" : "muted", style: { textAlign: "center", fontWeight: active ? "900" : "800" }, children: o.label }) }, o.key));
            })] }));
}
const styles = react_native_1.StyleSheet.create({
    wrap: {
        borderWidth: 1,
        borderRadius: 18,
        flexDirection: "row",
        padding: 4,
        overflow: "hidden",
    },
    indicator: {
        position: "absolute",
        left: 4,
        top: 4,
        width: 120,
        height: 36,
        borderRadius: 14,
        borderWidth: 1,
    },
    item: {
        width: 120,
        height: 36,
        justifyContent: "center",
    },
});
