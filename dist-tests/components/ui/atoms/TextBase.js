"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppText = AppText;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const provider_1 = require("@/theme/provider");
function resolveToneColor(tone, palette) {
    if (tone === 'muted')
        return palette.textMuted;
    if (tone === 'danger')
        return palette.danger;
    if (tone === 'success')
        return palette.success;
    if (tone === 'warning')
        return palette.warning;
    return palette.text;
}
function AppText({ tone = 'default', size = 'md', weight = 'regular', style, children, ...rest }) {
    const { colors, typography } = (0, provider_1.useTheme)();
    return ((0, jsx_runtime_1.jsx)(react_native_1.Text, { ...rest, style: [
            {
                color: resolveToneColor(tone, colors),
                fontSize: typography.size[size],
                lineHeight: typography.lineHeight[size],
                fontWeight: typography.weight[weight],
            },
            style,
        ], children: children }));
}
