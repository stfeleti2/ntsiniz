"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Surface = Surface;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const Box_1 = require("./Box");
const theme_1 = require("../theme");
function Surface({ tone = 'default', depth, accentRole, padding = 0, radius, style, children, testID, }) {
    const { colors, elevation: elev, radius: r } = (0, theme_1.useTheme)();
    const corner = radius ?? r[2];
    const resolvedDepth = depth ?? (tone === 'raised' ? 'raised' : tone === 'glass' ? 'raised' : tone === 'transparent' ? 'flat' : 'flat');
    const accentBorder = accentRole === 'primary'
        ? colors.accentLavender
        : accentRole === 'secondary'
            ? colors.accentCyan
            : accentRole === 'success'
                ? colors.success
                : accentRole === 'warning'
                    ? colors.warning
                    : colors.border;
    const bg = tone === 'transparent'
        ? 'transparent'
        : tone === 'glass'
            ? colors.surfaceGlass
            : resolvedDepth === 'inset'
                ? colors.surfaceInset
                : resolvedDepth === 'raised'
                    ? colors.surfaceRaised
                    : colors.surfaceBase;
    const shadow = tone === 'transparent'
        ? elev[0]
        : resolvedDepth === 'raised'
            ? elev.neumorphic.raised
            : resolvedDepth === 'pressed'
                ? elev.neumorphic.pressed
                : resolvedDepth === 'inset'
                    ? elev.neumorphic.inset
                    : tone === 'glass'
                        ? elev.neumorphic.glass
                        : elev.neumorphic.flat;
    return ((0, jsx_runtime_1.jsxs)(Box_1.Box, { testID: testID, style: [
            {
                backgroundColor: bg,
                padding,
                borderRadius: corner,
                borderWidth: tone === 'transparent' ? 0 : 1,
                borderColor: tone === 'transparent' ? 'transparent' : accentBorder,
                overflow: tone === 'transparent' ? 'visible' : 'hidden',
                shadowColor: colors.shadowDark,
                ...shadow,
            },
            tone === 'glass'
                ? {
                    borderColor: colors.borderStrong,
                }
                : null,
            style,
        ], children: [children, tone !== 'transparent' ? ((0, jsx_runtime_1.jsx)(Box_1.Box, { pointerEvents: "none", style: [react_native_1.StyleSheet.absoluteFill, { borderRadius: corner, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' }] })) : null, resolvedDepth === 'inset' ? ((0, jsx_runtime_1.jsx)(Box_1.Box, { pointerEvents: "none", style: [
                    styles.insetShadow,
                    {
                        borderRadius: corner,
                        shadowColor: colors.shadowDark,
                    },
                ] })) : null] }));
}
const styles = react_native_1.StyleSheet.create({
    insetShadow: {
        ...react_native_1.StyleSheet.absoluteFillObject,
        shadowOpacity: 0.22,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
});
