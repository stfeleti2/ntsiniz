"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Text = Text;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const theme_1 = require("../theme");
function Text({ tone = 'default', size = 'md', weight = 'regular', style, testID, ...rest }) {
    const { colors, typography } = (0, theme_1.useTheme)();
    const color = tone === 'muted'
        ? colors.muted
        : tone === 'danger'
            ? colors.danger
            : tone === 'success'
                ? colors.success
                : colors.text;
    return ((0, jsx_runtime_1.jsx)(react_native_1.Text, { accessibilityRole: rest.accessibilityRole ?? 'text', testID: testID, ...rest, style: [
            {
                color,
                fontSize: typography.size[size],
                lineHeight: typography.lineHeight[size],
                fontWeight: typography.weight[weight],
            },
            style,
        ] }));
}
