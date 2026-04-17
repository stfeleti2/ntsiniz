export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 56,

  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const

export type SpacingScale = typeof spacing
