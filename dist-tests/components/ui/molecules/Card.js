"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = Card;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const provider_1 = require("@/theme/provider");
const neumorphism_1 = require("@/theme/neumorphism");
function toneToVariant(tone) {
    if (tone === 'elevated')
        return 'raised';
    if (tone === 'glow')
        return 'glass';
    if (tone === 'warning')
        return 'inset';
    return 'flat';
}
function Card({ children, tone = 'default', style, testID, quality = 'full', }) {
    const theme = (0, provider_1.useTheme)();
    const variant = toneToVariant(tone);
    const surface = (0, neumorphism_1.getNeumorphicSurfaceStyle)(theme, {
        variant,
        quality,
        radius: theme.radius[3],
        padding: 14,
    });
    const warningStyle = tone === 'warning'
        ? {
            borderColor: theme.colors.warning,
        }
        : null;
    return ((0, jsx_runtime_1.jsx)(react_native_1.View, { testID: testID, style: [
            surface,
            {
                gap: theme.spacing[2],
            },
            warningStyle,
            style,
        ], children: children }));
}
