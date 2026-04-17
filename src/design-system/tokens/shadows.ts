import type { Theme } from '@/theme/provider/theme'
import { darkColors } from '@/theme/tokens/colors'

export type NeoShadowDepth = 'subtle' | 'medium' | 'deep'

export const neoShadowDepth = {
  subtle: { dark: 0.2, light: 0.18, radius: 6, offset: 2 },
  medium: { dark: 0.3, light: 0.24, radius: 10, offset: 4 },
  deep: { dark: 0.42, light: 0.32, radius: 16, offset: 8 },
} as const

export type CarvedDepth = 'soft' | 'normal' | 'strong'
export type TextShadowDepth = CarvedDepth
export type TextShadowVariant = 'carved' | 'embossed' | 'neo-soft'

const textShadowTokens = {
  carved: {
    soft: { darkAlpha: 0.18, lightAlpha: 0.16, offset: 1, radius: 1.5 },
    normal: { darkAlpha: 0.28, lightAlpha: 0.24, offset: 2, radius: 3 },
    strong: { darkAlpha: 0.38, lightAlpha: 0.32, offset: 3, radius: 4.5 },
  },
  embossed: {
    soft: { darkAlpha: 0.12, lightAlpha: 0.14, offset: -1, radius: 1.5 },
    normal: { darkAlpha: 0.2, lightAlpha: 0.22, offset: -2, radius: 2.8 },
    strong: { darkAlpha: 0.3, lightAlpha: 0.3, offset: -3, radius: 4.2 },
  },
  'neo-soft': {
    soft: { darkAlpha: 0.1, lightAlpha: 0.12, offset: 1, radius: 2 },
    normal: { darkAlpha: 0.16, lightAlpha: 0.2, offset: 2, radius: 3 },
    strong: { darkAlpha: 0.24, lightAlpha: 0.28, offset: 3, radius: 4 },
  },
} as const

export const carvedCssShadowTokens = {
  carvedLight: '0px 2px 3px rgba(255,255,255,0.5)',
  // TODO: Define carved text dark mode tokens with QA-verified contrast values.
  carvedDark: '0px 2px 3px rgba(24,34,64,0.45)',
} as const

function isDarkTheme(colors: Theme['colors']) {
  return colors.bg.toLowerCase() === darkColors.bg.toLowerCase()
}

export function resolveTextVariantShadow(
  colors: Theme['colors'],
  variant: TextShadowVariant,
  depth: TextShadowDepth,
): { textShadowColor: string; textShadowOffset: { width: number; height: number }; textShadowRadius: number } {
  const token = textShadowTokens[variant][depth]
  const darkMode = isDarkTheme(colors)
  const alpha = darkMode ? token.darkAlpha : token.lightAlpha
  const shadowBase = darkMode ? colors.neumorphicShadow : colors.shadowDark

  return {
    textShadowColor: shadowBase.replace(/\d*\.?\d+\)$/, `${alpha})`),
    textShadowOffset: { width: token.offset, height: token.offset },
    textShadowRadius: token.radius,
  }
}

export function carvedTextShadow(colors: Theme['colors'], depth: CarvedDepth): { textShadowColor: string; textShadowOffset: { width: number; height: number }; textShadowRadius: number } {
  return resolveTextVariantShadow(colors, 'carved', depth)
}

export function resolveNeoLayerShadow(theme: Theme, depth: NeoShadowDepth) {
  const token = neoShadowDepth[depth]
  return {
    shadowColor: theme.colors.shadowDark,
    shadowOpacity: token.dark,
    shadowRadius: token.radius,
    shadowOffset: { width: 0, height: token.offset },
    elevation: Math.max(1, token.offset),
  }
}
