"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = Card;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const primitives_1 = require("@/ui/primitives");
const theme_1 = require("@/ui/theme");
const useQuality_1 = require("@/ui/quality/useQuality");
function Card({ children, style, tone = "default", testID }) {
    const { colors, breakpoints } = (0, theme_1.useTheme)();
    const q = (0, useQuality_1.useQuality)();
    const { width } = (0, react_native_1.useWindowDimensions)();
    const padding = width >= breakpoints.tabletLg ? 20 : width >= breakpoints.tablet ? 18 : 16;
    const accentRole = tone === 'warning' ? 'warning' : tone === 'glow' ? 'primary' : undefined;
    const depth = tone === 'default' ? 'flat' : tone === 'warning' ? 'pressed' : 'raised';
    const mode = tone === 'glow' ? 'glass' : tone === 'default' ? 'default' : 'raised';
    return ((0, jsx_runtime_1.jsx)(primitives_1.Surface, { testID: testID, tone: mode, depth: depth, accentRole: accentRole, padding: padding, style: [
            {
                borderWidth: 1,
                borderColor: tone === 'warning' ? 'rgba(255, 215, 158, 0.58)' : tone === 'glow' ? 'rgba(191, 182, 255, 0.5)' : colors.border,
                backgroundColor: tone === 'warning'
                    ? 'rgba(56, 41, 29, 0.94)'
                    : tone === 'glow'
                        ? 'rgba(37, 45, 72, 0.52)'
                        : tone === 'elevated'
                            ? colors.surfaceRaised
                            : colors.surfaceBase,
            },
            tone === "glow"
                ? {
                    shadowColor: colors.accentLavender,
                    shadowOpacity: 0.32 * q.shadowScale,
                    shadowRadius: 26 * q.shadowScale,
                    shadowOffset: { width: 0, height: 14 },
                }
                : tone === 'warning'
                    ? {
                        shadowColor: colors.warning,
                        shadowOpacity: 0.24 * q.shadowScale,
                        shadowRadius: 16 * q.shadowScale,
                        shadowOffset: { width: 0, height: 8 },
                    }
                    : null,
            style,
        ], children: children }));
}
