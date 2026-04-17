export type TextVariant = 'default' | 'carved' | 'embossed' | 'neo-soft'
export type TextVariantDepth = 'soft' | 'normal' | 'strong'

type TextVariantToken = {
  letterSpacing: number
  selectable: boolean
  cursor: 'auto' | 'default'
}

const baseTextVariantTokens: Record<TextVariant, TextVariantToken> = {
  default: {
    letterSpacing: 0,
    selectable: true,
    cursor: 'auto',
  },
  carved: {
    letterSpacing: 2,
    selectable: false,
    cursor: 'default',
  },
  embossed: {
    letterSpacing: 1,
    selectable: false,
    cursor: 'default',
  },
  'neo-soft': {
    letterSpacing: 1.5,
    selectable: true,
    cursor: 'auto',
  },
}

const depthScale: Record<TextVariantDepth, number> = {
  soft: 0.92,
  normal: 1,
  strong: 1.08,
}

export function resolveTextVariantTypography(variant: TextVariant, depth: TextVariantDepth): TextVariantToken {
  const token = baseTextVariantTokens[variant]
  return {
    ...token,
    letterSpacing: Number((token.letterSpacing * depthScale[depth]).toFixed(2)),
  }
}
