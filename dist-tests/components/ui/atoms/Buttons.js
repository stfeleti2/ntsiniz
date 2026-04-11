"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrimaryButton = PrimaryButton;
exports.SecondaryButton = SecondaryButton;
exports.GhostButton = GhostButton;
exports.IconButton = IconButton;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const provider_1 = require("@/theme/provider");
const neumorphism_1 = require("@/theme/neumorphism");
const TextBase_1 = require("./TextBase");
const Icon_1 = require("./Icon");
function paletteFor(variant, theme) {
    if (variant === 'secondary') {
        return {
            backgroundColor: theme.colors.surfaceRaised,
            borderColor: theme.colors.borderStrong,
            textColor: theme.colors.text,
        };
    }
    if (variant === 'ghost') {
        return {
            backgroundColor: 'transparent',
            borderColor: theme.colors.border,
            textColor: theme.colors.textMuted,
        };
    }
    return {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        textColor: theme.colors.highContrastText,
    };
}
function AppButton({ label, variant, onPress, disabled, testID, style, quality = 'full', }) {
    const theme = (0, provider_1.useTheme)();
    const palette = paletteFor(variant, theme);
    const neumorphic = (0, neumorphism_1.getNeumorphicSurfaceStyle)(theme, {
        variant: variant === 'ghost' ? 'flat' : 'raised',
        quality,
        padding: 0,
        borderWidth: 1,
        radius: theme.radius[3],
    });
    return ((0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", disabled: disabled, onPress: onPress, testID: testID, style: ({ pressed }) => [
            styles.buttonBase,
            neumorphic,
            {
                backgroundColor: palette.backgroundColor,
                borderColor: palette.borderColor,
                opacity: disabled ? 0.45 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
            },
            style,
        ], children: (0, jsx_runtime_1.jsx)(TextBase_1.AppText, { size: "sm", weight: "semibold", style: { color: palette.textColor }, children: label }) }));
}
function PrimaryButton(props) {
    return (0, jsx_runtime_1.jsx)(AppButton, { ...props, variant: "primary" });
}
function SecondaryButton(props) {
    return (0, jsx_runtime_1.jsx)(AppButton, { ...props, variant: "secondary" });
}
function GhostButton(props) {
    return (0, jsx_runtime_1.jsx)(AppButton, { ...props, variant: "ghost" });
}
function IconButton({ icon, onPress, disabled, testID, style, quality = 'full' }) {
    const theme = (0, provider_1.useTheme)();
    const neumorphic = (0, neumorphism_1.getNeumorphicSurfaceStyle)(theme, {
        variant: 'raised',
        quality,
        radius: theme.radius.pill,
        padding: 0,
    });
    return ((0, jsx_runtime_1.jsx)(react_native_1.Pressable, { accessibilityRole: "button", disabled: disabled, onPress: onPress, testID: testID, style: ({ pressed }) => [
            styles.iconButton,
            neumorphic,
            {
                backgroundColor: theme.colors.surfaceRaised,
                borderColor: theme.colors.border,
                opacity: disabled ? 0.45 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
            },
            style,
        ], children: (0, jsx_runtime_1.jsx)(react_native_1.View, { children: (0, jsx_runtime_1.jsx)(Icon_1.Icon, { name: icon, size: 18, color: theme.colors.text }) }) }));
}
const styles = react_native_1.StyleSheet.create({
    buttonBase: {
        minHeight: 44,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
    },
    iconButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
    },
});
