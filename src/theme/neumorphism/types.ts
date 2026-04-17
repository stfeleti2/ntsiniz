import type { SurfaceVariant } from '@/theme/tokens/colors'

export type NeumorphismState = 'default' | 'pressed' | 'disabled'

export type NeumorphismRule = {
  variant: SurfaceVariant
  state: NeumorphismState
  borderAlpha: number
  shadowAlpha: number
  highlightAlpha: number
}

/** Alias so consumers don't need to import from two places. */
export type NeumorphElevation = SurfaceVariant

/** Quality hints passed to shadow generators and primitives. */
export type SurfaceQuality = 'full' | 'lite'

/** The computed output of the dual-shadow helper. */
export type DualShadow = {
  /** Dark drop-shadow (below-right on raised surfaces). */
  darkShadow: {
    shadowColor: string
    shadowOffset: { width: number; height: number }
    shadowOpacity: number
    shadowRadius: number
    elevation: number
  }
  /** Light highlight-shadow (above-left on raised surfaces). */
  lightShadow: {
    shadowColor: string
    shadowOffset: { width: number; height: number }
    shadowOpacity: number
    shadowRadius: number
    elevation: 0
  }
  backgroundColor: string
}
