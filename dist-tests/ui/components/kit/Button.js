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
exports.Button = Button;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const primitives_1 = require("../../primitives");
const theme_1 = require("../../theme");
function Button({ label, onPress, disabled, loading, variant = 'primary', style, testID, accessibilityLabel, }) {
    const { colors, radius, spacing, elevation: elev } = (0, theme_1.useTheme)();
    const press = (0, react_native_reanimated_1.useSharedValue)(disabled ? 1 : 0);
    react_1.default.useEffect(() => {
        if (disabled || loading) {
            press.value = (0, react_native_reanimated_1.withTiming)(0, { duration: 120, easing: react_native_reanimated_1.Easing.out(react_native_reanimated_1.Easing.quad) });
        }
    }, [disabled, loading, press]);
    const bg = variant === 'primary'
        ? colors.primary
        : variant === 'secondary'
            ? colors.surfaceRaised
            : variant === 'danger'
                ? colors.danger
                : colors.surfaceGlass;
    const borderColor = variant === 'primary'
        ? 'rgba(227, 220, 255, 0.64)'
        : variant === 'ghost'
            ? colors.borderStrong
            : variant === 'danger'
                ? 'rgba(255, 196, 208, 0.6)'
                : colors.border;
    const textColor = variant === 'primary' ? '#100B20' : variant === 'danger' ? '#2C0E18' : colors.text;
    const animatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        const pressed = press.value;
        const depth = pressed > 0.5 ? elev.neumorphic.pressed : elev.neumorphic.raised;
        return {
            transform: [{ translateY: pressed > 0.5 ? 1 : 0 }, { scale: pressed > 0.5 ? 0.995 : 1 }],
            shadowOpacity: depth.shadowOpacity,
            shadowRadius: depth.shadowRadius,
            shadowOffset: depth.shadowOffset,
            elevation: depth.elevation,
        };
    });
    return ((0, jsx_runtime_1.jsx)(primitives_1.Pressable, { testID: testID, accessibilityRole: "button", accessibilityLabel: accessibilityLabel ?? label, disabled: disabled || loading, onPress: onPress, onPressIn: () => {
            if (disabled || loading)
                return;
            press.value = (0, react_native_reanimated_1.withTiming)(1, { duration: 110, easing: react_native_reanimated_1.Easing.out(react_native_reanimated_1.Easing.quad) });
        }, onPressOut: () => {
            press.value = (0, react_native_reanimated_1.withTiming)(0, { duration: 150, easing: react_native_reanimated_1.Easing.out(react_native_reanimated_1.Easing.cubic) });
        }, style: { opacity: disabled ? 0.52 : 1 }, children: (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: [
                {
                    minHeight: 48,
                    paddingVertical: spacing[3],
                    paddingHorizontal: spacing[4],
                    borderRadius: radius[3],
                    backgroundColor: bg,
                    borderWidth: 1,
                    borderColor,
                    justifyContent: 'center',
                    shadowColor: colors.shadowDark,
                },
                animatedStyle,
                style,
            ], children: (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { direction: "horizontal", gap: 8, align: "center", justify: "center", children: [loading ? (0, jsx_runtime_1.jsx)(react_native_1.ActivityIndicator, { color: textColor }) : null, (0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: "semibold", style: { textAlign: 'center', color: textColor }, children: label })] }) }) }));
}
