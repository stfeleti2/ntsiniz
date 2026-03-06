"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = useTheme;
const theme_1 = require("@/ui/theme/theme");
/**
 * Back-compat theme hook.
 *
 * The app previously used `src/theme/*` directly. The new UI system lives under `src/ui/*`.
 * This hook keeps legacy callers stable while all styling values now come from the new tokens.
 */
function useTheme() {
    const c = theme_1.theme.colors;
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
            primary: [c.primary, "#FF3DCE", c.warning],
            hero: [c.bg, "#2A1255", c.bg],
            surface: [c.surface, c.surface2],
            glow: ["rgba(124, 92, 255, 0.35)", "rgba(255, 61, 206, 0.22)", "rgba(0, 229, 255, 0.16)"],
        },
        spacing: {
            xs: theme_1.theme.spacing.xs,
            sm: theme_1.theme.spacing.sm,
            md: theme_1.theme.spacing.md,
            lg: theme_1.theme.spacing.lg,
            xl: theme_1.theme.spacing.xl,
        },
        radius: {
            md: theme_1.theme.radius.md,
            lg: theme_1.theme.radius.lg,
        },
    };
}
