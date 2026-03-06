export const radius = {
  0: 0,
  1: 6,
  2: 10,
  3: 14,
  4: 18,
  pill: 999,

  // Named aliases for legacy + ergonomic usage
  sm: 6,
  md: 10,
  lg: 14,
} as const

export type RadiusScale = typeof radius
