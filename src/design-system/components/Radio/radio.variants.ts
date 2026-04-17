import type { ViewStyle } from 'react-native'
import type { Theme } from '@/theme/provider/theme'

export type RadioVariant = 'neo-dot' | 'neo-glow'
export type RadioState = 'default' | 'hover' | 'active' | 'disabled'

export function resolveRadioStyle(input: {
  theme: Theme
  variant: RadioVariant
  selected: boolean
  state: RadioState
}): {
  outer: ViewStyle
  inner: ViewStyle
} {
  const { theme, variant, selected, state } = input
  const isGlow = variant === 'neo-glow'

  return {
    outer: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: selected ? theme.colors.primary : theme.colors.borderStrong,
      backgroundColor: selected
        ? isGlow
          ? theme.colors.surfaceGlass
          : theme.colors.surfaceRaised
        : theme.colors.surface,
      shadowColor: isGlow ? theme.colors.primary : theme.colors.shadowDark,
      shadowOpacity: selected ? (isGlow ? 0.34 : 0.22) : 0.16,
      shadowRadius: selected ? (isGlow ? 10 : 6) : 4,
      shadowOffset: { width: 0, height: selected ? (isGlow ? 6 : 3) : 2 },
      elevation: selected ? (isGlow ? 5 : 3) : 1,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: state === 'disabled' ? 0.5 : 1,
      transform: [{ scale: state === 'active' ? 0.96 : state === 'hover' ? 1.04 : 1 }],
    },
    inner: {
      width: selected ? 12 : 8,
      height: selected ? 12 : 8,
      borderRadius: 6,
      backgroundColor: selected
        ? isGlow
          ? theme.colors.secondary
          : theme.colors.primary
        : theme.colors.surfaceInset,
    },
  }
}
