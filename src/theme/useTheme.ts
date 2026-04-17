import { useTheme as useUiTheme } from "@/theme/provider"

/**
 * Back-compat theme hook.
 *
 * Legacy app surfaces still read from `src/theme/useTheme`.
 * This adapter keeps those callers stable while canonical tokens and providers live in `src/theme/*`.
 */
export function useTheme() {
  const uiTheme = useUiTheme()
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
      primary: uiTheme.gradients.primary,
      hero: uiTheme.gradients.hero,
      surface: uiTheme.gradients.surface,
      glow: uiTheme.gradients.glow,
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
