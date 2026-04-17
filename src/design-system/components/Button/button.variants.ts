import type { ViewStyle } from 'react-native'
import type { Theme } from '@/theme/provider/theme'

export type ComponentState = 'default' | 'hover' | 'active' | 'disabled'
export type ComponentSize = 'sm' | 'md' | 'lg'
export type ButtonTheme = 'light' | 'dark'

export type ButtonVariantKey =
  | 'primary-light-rounded'
  | 'icon-round-dark'
  | 'neo-depth-button'
  | 'active-led-button'
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'

export type ButtonVariantStyle = {
  container: ViewStyle
  labelColorToken: 'text' | 'highContrastText' | 'primary' | 'secondary'
}

const sizeMap: Record<ComponentSize, Pick<ViewStyle, 'minHeight' | 'paddingHorizontal' | 'paddingVertical'>> = {
  sm: { minHeight: 36, paddingHorizontal: 12, paddingVertical: 8 },
  md: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 12 },
  lg: { minHeight: 56, paddingHorizontal: 20, paddingVertical: 16 },
}

function variantBase(theme: Theme, variant: ButtonVariantKey): Pick<ViewStyle, 'backgroundColor' | 'borderColor' | 'borderWidth' | 'borderRadius'> {
  if (variant === 'icon-round-dark') {
    return {
      backgroundColor: theme.colors.surface2,
      borderColor: theme.colors.borderStrong,
      borderWidth: 1,
      borderRadius: 999,
    }
  }

  if (variant === 'neo-depth-button') {
    return {
      backgroundColor: theme.colors.surfaceRaised,
      borderColor: theme.colors.borderStrong,
      borderWidth: 1,
      borderRadius: 18,
    }
  }

  if (variant === 'active-led-button') {
    return {
      backgroundColor: theme.colors.surfaceGlass,
      borderColor: theme.colors.primary,
      borderWidth: 1,
      borderRadius: 18,
    }
  }

  if (variant === 'secondary') {
    return {
      backgroundColor: theme.colors.surfaceRaised,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 16,
    }
  }

  if (variant === 'ghost') {
    return {
      backgroundColor: theme.colors.surfaceGlass,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 16,
    }
  }

  if (variant === 'danger') {
    return {
      backgroundColor: theme.colors.danger,
      borderColor: theme.colors.danger,
      borderWidth: 1,
      borderRadius: 16,
    }
  }

  return {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: 20,
  }
}

function stateStyle(theme: Theme, state: ComponentState): Pick<ViewStyle, 'opacity' | 'transform'> {
  if (state === 'disabled') return { opacity: 0.5, transform: [{ scale: 1 }] }
  if (state === 'active') return { opacity: 1, transform: [{ scale: 0.985 }] }
  if (state === 'hover') return { opacity: 0.97, transform: [{ scale: 1.01 }] }
  return { opacity: 1, transform: [{ scale: 1 }] }
}

function labelTokenForVariant(variant: ButtonVariantKey): ButtonVariantStyle['labelColorToken'] {
  if (variant === 'primary-light-rounded' || variant === 'primary' || variant === 'danger') {
    return 'highContrastText'
  }

  if (variant === 'active-led-button') return 'primary'
  if (variant === 'icon-round-dark') return 'secondary'
  return 'text'
}

export function resolveButtonVariantStyle(input: {
  theme: Theme
  variant: ButtonVariantKey
  size: ComponentSize
  state: ComponentState
  mode: ButtonTheme
}): ButtonVariantStyle {
  const { theme, variant, size, state, mode } = input
  const base = variantBase(theme, variant)
  const sizeStyle = sizeMap[size]
  const stateResolved = stateStyle(theme, state)

  const modeAdjust: Pick<ViewStyle, 'shadowColor' | 'shadowOpacity' | 'shadowRadius' | 'shadowOffset' | 'elevation'> =
    mode === 'light'
      ? {
          shadowColor: theme.colors.shadowDark,
          shadowOpacity: state === 'active' ? 0.18 : 0.28,
          shadowRadius: state === 'active' ? 8 : 12,
          shadowOffset: { width: 0, height: state === 'active' ? 2 : 4 },
          elevation: state === 'active' ? 2 : 4,
        }
      : {
          shadowColor: theme.colors.shadowDark,
          shadowOpacity: state === 'active' ? 0.35 : 0.46,
          shadowRadius: state === 'active' ? 10 : 14,
          shadowOffset: { width: 0, height: state === 'active' ? 2 : 5 },
          elevation: state === 'active' ? 3 : 6,
        }

  return {
    container: {
      ...sizeStyle,
      ...base,
      ...stateResolved,
      ...modeAdjust,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    labelColorToken: labelTokenForVariant(variant),
  }
}
