import type { SurfaceVariant } from '@/theme/tokens/colors'

export type NeumorphismState = 'default' | 'pressed' | 'disabled'

export type NeumorphismRule = {
  variant: SurfaceVariant
  state: NeumorphismState
  borderAlpha: number
  shadowAlpha: number
  highlightAlpha: number
}
