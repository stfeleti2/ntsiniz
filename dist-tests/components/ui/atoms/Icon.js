"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Icon = Icon;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const provider_1 = require("@/theme/provider");
const glyphMap = {
    mic: '🎤',
    play: '▶',
    pause: '⏸',
    check: '✓',
    warning: '!',
    info: 'i',
    star: '★',
    close: '✕',
};
function Icon({ name, size = 18, color, style }) {
    const { colors } = (0, provider_1.useTheme)();
    return ((0, jsx_runtime_1.jsx)(react_native_1.Text, { accessibilityRole: "image", style: [
            {
                color: color ?? colors.text,
                fontSize: size,
                lineHeight: Math.round(size * 1.15),
                fontWeight: '700',
            },
            style,
        ], children: glyphMap[name] }));
}
