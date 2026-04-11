export type ElevationLevel = 0 | 1 | 2
export type NeumorphicElevationLevel = 'flat' | 'raised' | 'inset' | 'pressed' | 'glass'

export const elevation = {
  0: { shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 0 },
  1: { shadowOpacity: 0.24, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  2: { shadowOpacity: 0.34, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 6 },
  neumorphic: {
    flat: { shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 0 },
    raised: { shadowOpacity: 0.42, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 7 },
    inset: { shadowOpacity: 0.16, shadowRadius: 9, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
    pressed: { shadowOpacity: 0.24, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
    glass: { shadowOpacity: 0.36, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
  },
} as const

export type ElevationTierMap = Record<NeumorphicElevationLevel, (typeof elevation)['neumorphic'][NeumorphicElevationLevel]>
