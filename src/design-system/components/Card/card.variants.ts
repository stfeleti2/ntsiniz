import type { ViewStyle } from 'react-native'
import type { Theme } from '@/theme/provider/theme'

export type CardVariant = 'flat-neo-card' | 'layered-card' | 'animated-hover-card' | 'glow-active-card'
export type CardState = 'default' | 'hover' | 'active' | 'disabled'

export function resolveCardVariantStyle(input: {
  theme: Theme
  variant: CardVariant
  state: CardState
  mode: 'light' | 'dark'
}): ViewStyle {
  const { theme, variant, state, mode } = input

  if (variant === 'layered-card') {
    return {
      backgroundColor: theme.colors.surfaceRaised,
      borderColor: theme.colors.borderStrong,
      borderWidth: 1,
      borderRadius: 22,
      shadowColor: theme.colors.shadowDark,
      shadowOpacity: mode === 'dark' ? 0.45 : 0.25,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
      transform: [{ scale: state === 'hover' ? 1.01 : 1 }],
      opacity: state === 'disabled' ? 0.56 : 1,
    }
  }

  if (variant === 'animated-hover-card') {
    return {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 22,
      shadowColor: theme.colors.shadowDark,
      shadowOpacity: state === 'hover' ? 0.38 : 0.22,
      shadowRadius: state === 'hover' ? 18 : 10,
      shadowOffset: { width: 0, height: state === 'hover' ? 10 : 5 },
      elevation: state === 'hover' ? 6 : 3,
      transform: [{ scale: state === 'hover' ? 1.02 : state === 'active' ? 0.99 : 1 }],
      opacity: state === 'disabled' ? 0.56 : 1,
    }
  }

  if (variant === 'glow-active-card') {
    return {
      backgroundColor: theme.colors.surfaceGlass,
      borderColor: theme.colors.primary,
      borderWidth: 1,
      borderRadius: 22,
      shadowColor: theme.colors.primary,
      shadowOpacity: state === 'active' ? 0.45 : 0.28,
      shadowRadius: state === 'active' ? 20 : 14,
      shadowOffset: { width: 0, height: state === 'active' ? 10 : 6 },
      elevation: state === 'active' ? 7 : 4,
      opacity: state === 'disabled' ? 0.5 : 1,
    }
  }

  return {
    backgroundColor: theme.colors.surfaceBase,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 22,
    shadowColor: theme.colors.shadowDark,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    opacity: state === 'disabled' ? 0.56 : 1,
  }
}
