import { colors, spacing, typography, radius, elevation, motion, zIndex } from '../tokens'

export const theme = {
  colors,
  spacing,
  typography,
  radius,
  elevation,
  motion,
  zIndex,
} as const

export type Theme = typeof theme
