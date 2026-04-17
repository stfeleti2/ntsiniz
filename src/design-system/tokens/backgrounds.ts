import type { Theme } from '@/theme/provider/theme'
import { lightColors } from '@/theme/tokens/colors'
import type { DesignSystemTheme } from './colors'
import { designSystemColors } from './colors'
import { resolveNeoLayerShadow, type NeoShadowDepth } from './shadows'
import { textureTokens, type NeoTexture } from './textures'

export type BackgroundVariant = 'solid' | 'texture' | 'layered'
export type StorybookBackgroundPreset = 'light' | 'dark' | 'neo-light' | 'neo-dark' | 'texture'

type BackgroundSpec = {
  backgroundColor: string
  borderColor: string
  texture: NeoTexture
  overlayColor: string
  layerColor: string
  shadowDepth: NeoShadowDepth
}

const backgroundTokens: Record<DesignSystemTheme, Record<BackgroundVariant, BackgroundSpec>> = {
  dark: {
    solid: {
      backgroundColor: designSystemColors.dark.canvas,
      borderColor: designSystemColors.dark.surface,
      texture: 'none',
      overlayColor: designSystemColors.dark.surface,
      layerColor: designSystemColors.dark.surface,
      shadowDepth: 'subtle',
    },
    texture: {
      backgroundColor: designSystemColors.dark.textureSurface,
      borderColor: designSystemColors.dark.textureOverlay,
      texture: 'grain',
      overlayColor: designSystemColors.dark.textureOverlay,
      layerColor: designSystemColors.dark.surface,
      shadowDepth: 'medium',
    },
    layered: {
      backgroundColor: designSystemColors.dark.layeredSurface,
      borderColor: designSystemColors.dark.layeredEdge,
      texture: 'mesh',
      overlayColor: designSystemColors.dark.layeredOverlay,
      layerColor: designSystemColors.dark.elevated,
      shadowDepth: 'deep',
    },
  },
  light: {
    solid: {
      backgroundColor: designSystemColors.light.canvas,
      borderColor: designSystemColors.light.surface,
      texture: 'none',
      overlayColor: designSystemColors.light.surface,
      layerColor: designSystemColors.light.surface,
      shadowDepth: 'subtle',
    },
    texture: {
      backgroundColor: designSystemColors.light.textureSurface,
      borderColor: designSystemColors.light.textureOverlay,
      texture: 'grain',
      overlayColor: designSystemColors.light.textureOverlay,
      layerColor: designSystemColors.light.surface,
      shadowDepth: 'medium',
    },
    layered: {
      backgroundColor: designSystemColors.light.layeredSurface,
      borderColor: designSystemColors.light.layeredEdge,
      texture: 'mesh',
      overlayColor: designSystemColors.light.layeredOverlay,
      layerColor: designSystemColors.light.elevated,
      shadowDepth: 'deep',
    },
  },
}

export const storybookBackgroundValues: ReadonlyArray<{
  name: StorybookBackgroundPreset
  value: string
}> = [
  { name: 'light', value: backgroundTokens.light.solid.backgroundColor },
  { name: 'dark', value: backgroundTokens.dark.solid.backgroundColor },
  { name: 'neo-light', value: backgroundTokens.light.layered.backgroundColor },
  { name: 'neo-dark', value: backgroundTokens.dark.layered.backgroundColor },
  { name: 'texture', value: backgroundTokens.dark.texture.backgroundColor },
]

// Kept for non-Storybook callers that still select background primitive variants directly.
export const backgroundToolbarItems: ReadonlyArray<BackgroundVariant> = ['solid', 'texture', 'layered']

function resolveMode(theme: Theme, mode?: DesignSystemTheme): DesignSystemTheme {
  if (mode) return mode
  return theme.colors.bg.toLowerCase() === lightColors.bg.toLowerCase() ? 'light' : 'dark'
}

export function resolveBackgroundToken(mode: DesignSystemTheme, variant: BackgroundVariant): BackgroundSpec {
  return backgroundTokens[mode][variant]
}

export function resolveBackgroundStyle(theme: Theme, variant: BackgroundVariant, mode?: DesignSystemTheme) {
  const resolvedMode = resolveMode(theme, mode)
  const token = resolveBackgroundToken(resolvedMode, variant)
  const texture = textureTokens[resolvedMode][token.texture]
  const shadow = resolveNeoLayerShadow(theme, token.shadowDepth)

  return {
    mode: resolvedMode,
    token,
    texture,
    shadow,
  }
}

export function resolveStorybookBackground(mode: DesignSystemTheme, variant: BackgroundVariant): string {
  return backgroundTokens[mode][variant].backgroundColor
}
