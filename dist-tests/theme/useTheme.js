"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = useTheme;
const provider_1 = require("@/theme/provider");
/**
 * Back-compat theme hook.
 *
 * Legacy app surfaces still read from `src/theme/useTheme`.
 * This adapter keeps those callers stable while canonical tokens and providers live in `src/theme/*`.
 */
function useTheme() {
    const uiTheme = (0, provider_1.useTheme)();
    const c = uiTheme.colors;
    // Map new tokens to old keys used across legacy components/screens.
    return {
        colors: {
            bg: c.bg,
            card: c.surface,
            text: c.text,
            muted: c.muted,
            accent: c.primary,
            accent2: c.primary,
            accent3: c.primary,
            good: c.success,
            warn: c.warning,
            bad: c.danger,
            line: c.border,
        },
        gradients: {
            primary: [c.primary, c.accentPink, c.secondary],
            hero: [c.bg, '#1A1436', '#231B45', c.bg],
            surface: [c.surfaceBase, c.surfaceRaised],
            glow: ['rgba(153, 129, 255, 0.38)', 'rgba(246, 166, 255, 0.24)', 'rgba(137, 233, 255, 0.2)'],
        },
        spacing: {
            xs: uiTheme.spacing.xs,
            sm: uiTheme.spacing.sm,
            md: uiTheme.spacing.md,
            lg: uiTheme.spacing.lg,
            xl: uiTheme.spacing.xl,
        },
        radius: {
            md: uiTheme.radius.md,
            lg: uiTheme.radius.lg,
        },
    };
}
