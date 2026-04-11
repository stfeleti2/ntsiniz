"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = Input;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const primitives_1 = require("../../primitives");
const theme_1 = require("../../theme");
function Input({ value, onChangeText, placeholder, label, helperText, errorText, leftIcon, rightIcon, disabled, testID, accessibilityLabel, style, ...inputProps }) {
    const { colors, spacing, radius } = (0, theme_1.useTheme)();
    const border = errorText ? colors.danger : colors.border;
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Stack, { gap: 6, style: style, children: [label ? (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", weight: "semibold", children: label }) : null, (0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingHorizontal: spacing[3],
                    paddingVertical: spacing[3],
                    borderRadius: radius[3],
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: colors.surfaceInset,
                    shadowColor: colors.shadowDark,
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 1,
                    opacity: disabled ? 0.55 : 1,
                }, children: [leftIcon, (0, jsx_runtime_1.jsx)(react_native_1.TextInput, { testID: testID, accessibilityLabel: accessibilityLabel ?? label ?? placeholder, editable: !disabled, value: value, onChangeText: onChangeText, placeholder: placeholder, placeholderTextColor: colors.muted, style: { flex: 1, color: colors.text, fontSize: 16 }, ...inputProps }), rightIcon] }), errorText ? (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "danger", children: errorText }) : helperText ? (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: helperText }) : null] }));
}
