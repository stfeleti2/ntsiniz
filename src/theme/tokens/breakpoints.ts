export const breakpoints = {
  phone: 0,
  phoneLg: 390,
  tablet: 768,
  tabletLg: 1024,
  desktop: 1280,
} as const

export type Breakpoints = typeof breakpoints
