"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextInput = TextInput;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const provider_1 = require("@/theme/provider");
const neumorphism_1 = require("@/theme/neumorphism");
const TextBase_1 = require("./TextBase");
function TextInput({ label, helperText, errorText, containerStyle, quality = 'full', style, ...rest }) {
    const theme = (0, provider_1.useTheme)();
    const hasError = !!errorText;
    const surfaceStyle = (0, neumorphism_1.getNeumorphicSurfaceStyle)(theme, {
        variant: hasError ? 'inset' : 'raised',
        state: hasError ? 'pressed' : 'default',
        quality,
        radius: theme.radius[3],
        padding: 0,
    });
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles.wrapper, containerStyle], children: [label ? (0, jsx_runtime_1.jsx)(TextBase_1.AppText, { size: "sm", tone: "muted", children: label }) : null, (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [
                    styles.inputShell,
                    surfaceStyle,
                    {
                        borderColor: hasError ? theme.colors.danger : theme.colors.border,
                        backgroundColor: theme.colors.surfaceRaised,
                    },
                ], children: (0, jsx_runtime_1.jsx)(react_native_1.TextInput, { ...rest, placeholderTextColor: theme.colors.textSubtle, style: [
                        styles.input,
                        {
                            color: theme.colors.text,
                        },
                        style,
                    ] }) }), errorText ? (0, jsx_runtime_1.jsx)(TextBase_1.AppText, { size: "sm", tone: "danger", children: errorText }) : null, !errorText && helperText ? (0, jsx_runtime_1.jsx)(TextBase_1.AppText, { size: "sm", tone: "muted", children: helperText }) : null] }));
}
const styles = react_native_1.StyleSheet.create({
    wrapper: {
        gap: 6,
    },
    inputShell: {
        minHeight: 46,
        borderRadius: 14,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 14,
    },
    input: {
        fontSize: 16,
        lineHeight: 22,
        paddingVertical: 8,
    },
});
