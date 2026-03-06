"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = Button;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const primitives_1 = require("../../primitives");
const theme_1 = require("../../theme");
function Button({ label, onPress, disabled, loading, variant = 'primary', style, testID, accessibilityLabel, }) {
    const { colors, radius, spacing } = (0, theme_1.useTheme)();
    const bg = variant === 'primary'
        ? colors.primary
        : variant === 'secondary'
            ? colors.surface2
            : variant === 'danger'
                ? colors.danger
                : 'transparent';
    const borderColor = variant === 'ghost' ? colors.border : 'transparent';
    return ((0, jsx_runtime_1.jsx)(primitives_1.Pressable, { testID: testID, accessibilityRole: "button", accessibilityLabel: accessibilityLabel ?? label, disabled: disabled || loading, onPress: onPress, style: ({ pressed }) => [
            {
                paddingVertical: spacing[3],
                paddingHorizontal: spacing[4],
                borderRadius: radius[3],
                backgroundColor: bg,
                borderWidth: borderColor === 'transparent' ? 0 : 1,
                borderColor,
                opacity: disabled ? 0.55 : pressed ? 0.9 : 1,
            },
            style,
        ], children: (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { direction: "horizontal", gap: 8, align: "center", justify: "center", children: [loading ? (0, jsx_runtime_1.jsx)(react_native_1.ActivityIndicator, {}) : null, (0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: "semibold", style: { textAlign: 'center' }, children: label })] }) }));
}
