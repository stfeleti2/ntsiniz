import type { ViewStyle } from 'react-native'
import type { Theme } from '@/theme/provider/theme'

export type ImagePanelVariant = 'neo-image' | 'depth-inset' | 'overlay-glow'
export type ImagePanelState = 'default' | 'hover' | 'active' | 'disabled'

export function resolveImagePanelStyle(input: {
  theme: Theme
  variant: ImagePanelVariant
  state: ImagePanelState
  mode: 'light' | 'dark'
}): {
  container: ViewStyle
  overlay: ViewStyle
} {
  const { theme, variant, state, mode } = input

  const container: ViewStyle = {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceRaised,
    overflow: 'hidden',
    opacity: state === 'disabled' ? 0.5 : 1,
  }

  const overlay: ViewStyle = {
    ...({} as ViewStyle),
    backgroundColor: 'transparent',
  }

  if (variant === 'depth-inset') {
    container.backgroundColor = theme.colors.surfaceInset
    container.borderColor = theme.colors.borderStrong
    container.shadowColor = theme.colors.shadowDark
    container.shadowOpacity = 0.2
    container.shadowRadius = 6
    container.shadowOffset = { width: 0, height: 2 }
    container.elevation = 2
    overlay.backgroundColor = mode === 'dark' ? 'rgba(4,8,18,0.18)' : 'rgba(235,242,255,0.44)'
  } else if (variant === 'overlay-glow') {
    container.backgroundColor = theme.colors.surfaceGlass
    container.borderColor = theme.colors.primary
    container.shadowColor = theme.colors.primary
    container.shadowOpacity = state === 'active' ? 0.4 : 0.25
    container.shadowRadius = state === 'active' ? 20 : 12
    container.shadowOffset = { width: 0, height: state === 'active' ? 10 : 6 }
    container.elevation = state === 'active' ? 7 : 4
    overlay.backgroundColor = mode === 'dark' ? 'rgba(133,153,255,0.2)' : 'rgba(117,102,255,0.16)'
  } else {
    container.shadowColor = theme.colors.shadowDark
    container.shadowOpacity = state === 'hover' ? 0.32 : 0.2
    container.shadowRadius = state === 'hover' ? 14 : 8
    container.shadowOffset = { width: 0, height: state === 'hover' ? 8 : 4 }
    container.elevation = state === 'hover' ? 5 : 3
    overlay.backgroundColor = mode === 'dark' ? 'rgba(9,12,24,0.12)' : 'rgba(247,251,255,0.58)'
  }

  return { container, overlay }
}
