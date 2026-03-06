"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListRow = ListRow;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("../../primitives");
const theme_1 = require("../../theme");
function ListRow({ title, subtitle, leftIcon, right, onPress, disabled, testID, style }) {
    const { colors, spacing, radius } = (0, theme_1.useTheme)();
    return ((0, jsx_runtime_1.jsx)(primitives_1.Pressable, { testID: testID, accessibilityRole: onPress ? 'button' : 'text', accessibilityLabel: title, disabled: disabled || !onPress, onPress: onPress, style: ({ pressed }) => [
            {
                paddingHorizontal: spacing[4],
                paddingVertical: spacing[3],
                borderRadius: radius[3],
                backgroundColor: colors.surface2,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
            },
            style,
        ], children: (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { direction: "horizontal", gap: 12, align: "center", justify: "space-between", children: [(0, jsx_runtime_1.jsxs)(primitives_1.Stack, { direction: "horizontal", gap: 12, align: "center", style: { flex: 1 }, children: [leftIcon ? (0, jsx_runtime_1.jsx)(primitives_1.Icon, { name: leftIcon }) : null, (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { gap: 2, style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: "semibold", children: title }), subtitle ? (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "sm", tone: "muted", children: subtitle }) : null] })] }), right ?? (onPress ? (0, jsx_runtime_1.jsx)(primitives_1.Icon, { name: '> ' }) : null)] }) }));
}
