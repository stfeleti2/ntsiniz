"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = void 0;
exports.buildTheme = buildTheme;
const tokens_1 = require("@/theme/tokens");
function motionScaleForPreset(preset) {
    if (preset === 'snappy')
        return 0.82;
    if (preset === 'calm')
        return 1.24;
    return 1;
}
function buildMotion(preset, reducedMotion) {
    if (reducedMotion) {
        return {
            fast: 0,
            normal: 0,
            slow: 0,
        };
    }
    const scale = motionScaleForPreset(preset);
    return {
        fast: Math.round(tokens_1.motion.fast * scale),
        normal: Math.round(tokens_1.motion.normal * scale),
        slow: Math.round(tokens_1.motion.slow * scale),
    };
}
function buildTheme(options) {
    const mode = options?.mode ?? 'dark';
    const colors = mode === 'light' ? tokens_1.lightColors : tokens_1.darkColors;
    const motion = buildMotion(options?.motionPreset ?? 'normal', !!options?.reducedMotion);
    return {
        colors,
        spacing: tokens_1.spacing,
        typography: tokens_1.typography,
        radius: tokens_1.radius,
        elevation: tokens_1.elevation,
        motion,
        zIndex: tokens_1.zIndex,
        breakpoints: tokens_1.breakpoints,
        shadows: tokens_1.shadows,
    };
}
exports.theme = buildTheme();
