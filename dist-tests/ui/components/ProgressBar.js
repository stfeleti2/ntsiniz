"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = ProgressBar;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const theme_1 = require("@/ui/theme");
function ProgressBar({ pct, height = 10, style }) {
    const { colors } = (0, theme_1.useTheme)();
    const clamped = Math.max(0, Math.min(100, pct));
    return ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: [
            {
                height,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: colors.border,
            },
            style,
        ], children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: {
                height: '100%',
                width: `${clamped}%`,
                backgroundColor: colors.primary,
                opacity: 0.95,
            } }) }));
}
