import { theme as uiTheme } from "@/ui/theme/theme"

/**
 * Back-compat theme hook.
 *
 * The app previously used `src/theme/*` directly. The new UI system lives under `src/ui/*`.
 * This hook keeps legacy callers stable while all styling values now come from the new tokens.
 */
export function useTheme() {
  const c = uiTheme.colors

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
  } as const
}
