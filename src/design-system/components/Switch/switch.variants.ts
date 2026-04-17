import type { ViewStyle } from 'react-native'
import type { Theme } from '@/theme/provider/theme'

export type SwitchVariant = 'icon-round' | 'neo-toggle'
export type SwitchState = 'default' | 'hover' | 'active' | 'disabled'

export type SwitchVariantStyle = {
  track: ViewStyle
  thumb: ViewStyle
  iconColor: string
}

export function resolveSwitchVariantStyle(input: {
  theme: Theme
  variant: SwitchVariant
  checked: boolean
  state: SwitchState
  mode: 'light' | 'dark'
}): SwitchVariantStyle {
  const { theme, variant, checked, state } = input

  const trackBase: ViewStyle = {
    width: variant === 'icon-round' ? 68 : 64,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: checked ? theme.colors.primary : theme.colors.border,
    backgroundColor: checked ? theme.colors.surfaceRaised : theme.colors.surfaceInset,
    justifyContent: 'center',
    paddingHorizontal: 4,
    opacity: state === 'disabled' ? 0.5 : 1,
  }

  const thumbBase: ViewStyle = {
    width: variant === 'icon-round' ? 28 : 26,
    height: variant === 'icon-round' ? 28 : 26,
    borderRadius: 999,
    backgroundColor: checked ? theme.colors.primary : theme.colors.surface,
    borderWidth: 1,
    borderColor: checked ? theme.colors.primary : theme.colors.borderStrong,
    shadowColor: theme.colors.shadowDark,
    shadowOpacity: checked ? 0.34 : 0.2,
    shadowRadius: checked ? 8 : 5,
    shadowOffset: { width: 0, height: checked ? 4 : 2 },
    elevation: checked ? 4 : 2,
  }

  const activePulse: ViewStyle =
    state === 'active'
      ? {
          transform: [{ scale: 0.98 }],
        }
      : {}

  return {
    track: {
      ...trackBase,
      ...activePulse,
    },
    thumb: thumbBase,
    iconColor: checked ? theme.colors.highContrastIcon : theme.colors.textSubtle,
  }
}
