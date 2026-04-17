import { darkColors, lightColors } from '@/theme/tokens/colors'

export type DesignSystemTheme = 'dark' | 'light'
export type LegacyStorybookBackground = 'theme-canvas' | 'theme-surface' | 'theme-elevated' | 'stage-soft' | 'stage-strong'
export type TextStyleVariant = 'default' | 'carved' | 'embossed' | 'neo-soft'

export const designSystemColors = {
  dark: {
    canvas: darkColors.bg,
    surface: darkColors.surfaceBase,
    elevated: darkColors.surfaceRaised,
    stageSoft: 'rgba(14, 18, 35, 0.94)',
    stageStrong: 'rgba(7, 9, 17, 1)',
    textureSurface: darkColors.surfaceGlass,
    layeredSurface: darkColors.surfaceRaised,
    textureOverlay: 'rgba(188, 206, 255, 0.16)',
    layeredOverlay: 'rgba(132, 160, 255, 0.2)',
    layeredEdge: 'rgba(214, 220, 255, 0.38)',
    carvedBase: 'rgba(6, 9, 21, 0.9)',
    carvedTint: 'rgba(189, 204, 255, 0.2)',
    // TODO: Define carved text dark mode tokens with contrast-tested production values.
    carvedBgDark: 'rgba(7, 10, 22, 0.92)',
    embossedBase: darkColors.text,
    embossedTint: 'rgba(230, 236, 255, 0.3)',
    neoSoftBase: 'rgba(214, 224, 255, 0.92)',
    neoSoftTint: darkColors.surfaceGlass,
  },
  light: {
    canvas: lightColors.bg,
    surface: lightColors.surfaceBase,
    elevated: lightColors.surfaceRaised,
    stageSoft: 'rgba(240, 245, 255, 1)',
    stageStrong: 'rgba(218, 228, 252, 1)',
    textureSurface: lightColors.surfaceGlass,
    layeredSurface: lightColors.surfaceRaised,
    textureOverlay: 'rgba(102, 126, 185, 0.16)',
    layeredOverlay: 'rgba(123, 149, 212, 0.16)',
    layeredEdge: 'rgba(73, 99, 168, 0.34)',
    carvedBase: 'rgba(205, 215, 242, 0.96)',
    carvedTint: 'rgba(255, 255, 255, 0.78)',
    carvedBgLight: 'rgba(0,0,0,0.9)',
    embossedBase: lightColors.text,
    embossedTint: 'rgba(255, 255, 255, 0.84)',
    neoSoftBase: lightColors.text,
    neoSoftTint: 'rgba(255, 255, 255, 0.72)',
  },
} as const

export function resolveLegacyStorybookBackground(mode: DesignSystemTheme, background: LegacyStorybookBackground): string {
  const palette = designSystemColors[mode]
  if (background === 'theme-surface') return palette.surface
  if (background === 'theme-elevated') return palette.elevated
  if (background === 'stage-soft') return palette.stageSoft
  if (background === 'stage-strong') return palette.stageStrong
  return palette.canvas
}

export function resolveTextVariantColors(mode: DesignSystemTheme, variant: TextStyleVariant): {
  color: string
  tintColor?: string
  backgroundColor?: string
  webTextFillColor?: string
} {
  const palette = designSystemColors[mode]
  if (variant === 'carved') {
    const carvedBackground = mode === 'light' ? designSystemColors.light.carvedBgLight : designSystemColors.dark.carvedBgDark
    return {
      color: palette.carvedBase,
      tintColor: palette.carvedTint,
      backgroundColor: carvedBackground,
      webTextFillColor: 'transparent',
    }
  }
  if (variant === 'embossed') {
    return {
      color: palette.embossedBase,
      tintColor: palette.embossedTint,
    }
  }
  if (variant === 'neo-soft') {
    return {
      color: palette.neoSoftBase,
      tintColor: palette.neoSoftTint,
    }
  }
  return { color: mode === 'dark' ? darkColors.text : lightColors.text }
}

export const legacyStorybookBackgroundToolbarItems: ReadonlyArray<LegacyStorybookBackground> = [
  'theme-canvas',
  'theme-surface',
  'theme-elevated',
  'stage-soft',
  'stage-strong',
]
