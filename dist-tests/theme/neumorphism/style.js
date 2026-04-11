"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSurfaceColor = getSurfaceColor;
exports.getNeumorphicSurfaceStyle = getNeumorphicSurfaceStyle;
const rules_1 = require("./rules");
function hexToRgba(hex, alpha) {
    const normalized = hex.replace('#', '');
    if (normalized.length !== 6)
        return `rgba(0,0,0,${alpha})`;
    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}
function withAlpha(color, alpha) {
    if (color.startsWith('rgba(')) {
        return color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/, `rgba($1, $2, $3, ${alpha})`);
    }
    if (color.startsWith('rgb(')) {
        return color.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, `rgba($1, $2, $3, ${alpha})`);
    }
    if (color.startsWith('#'))
        return hexToRgba(color, alpha);
    return color;
}
function getSurfaceColor(theme, variant) {
    const { colors } = theme;
    if (variant === 'raised')
        return colors.surfaceRaised;
    if (variant === 'inset')
        return colors.surfaceInset;
    if (variant === 'pressed')
        return colors.surfaceInset;
    if (variant === 'glass')
        return colors.surfaceGlass;
    return colors.surfaceBase;
}
function getNeumorphicSurfaceStyle(theme, options = {}) {
    const variant = options.variant ?? 'flat';
    const state = options.state ?? 'default';
    const quality = options.quality ?? 'full';
    const rule = (0, rules_1.getNeumorphismRule)(variant, state);
    const baseElevation = theme.elevation.neumorphic[variant];
    const effectiveShadowOpacity = quality === 'lite' ? Math.min(baseElevation.shadowOpacity, 0.16) : baseElevation.shadowOpacity;
    return {
        backgroundColor: getSurfaceColor(theme, variant),
        borderWidth: options.borderWidth ?? 1,
        borderRadius: options.radius ?? theme.radius[3],
        borderColor: withAlpha(theme.colors.borderStrong, rule.borderAlpha),
        padding: options.padding ?? 0,
        shadowColor: withAlpha(theme.colors.shadowDark, Math.max(0.1, rule.shadowAlpha)),
        shadowOffset: baseElevation.shadowOffset,
        shadowRadius: quality === 'lite' ? Math.min(baseElevation.shadowRadius, 12) : baseElevation.shadowRadius,
        shadowOpacity: effectiveShadowOpacity,
        elevation: quality === 'lite' ? Math.min(baseElevation.elevation, 2) : baseElevation.elevation,
    };
}
