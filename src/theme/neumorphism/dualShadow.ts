/**
 * dualShadow — produces light + dark shadow pairs for neumorphic surfaces.
 *
 * iOS receives two independently-colored shadows via two absolutely-positioned
 * backing Views. Android receives a single `elevation` on the dark-shadow View;
 * the light-shadow View gets elevation:0 and is rendered as a subtle border tint.
 *
 * Inset and flat variants skip the dual-shadow entirely — they rely on background
 * colour and border cues only, which is more readable at small sizes.
 */

import type { Theme } from '@/theme/provider'
import type { NeumorphElevation, SurfaceQuality, DualShadow } from './types'
import { getNeumorphismRule } from './rules'
import { getSurfaceColor } from './style'

/** Variants that receive the full dual-shadow treatment. */
const RAISED_VARIANTS: NeumorphElevation[] = ['raised', 'glass']

/** Scale the shadow intensity down for LITE quality. */
function scaleByQuality(value: number, quality: SurfaceQuality): number {
  return quality === 'lite' ? value * 0.45 : value
}

export function getDualShadow(
  theme: Theme,
  elevation: NeumorphElevation,
  quality: SurfaceQuality = 'full',
  state: 'default' | 'pressed' | 'disabled' = 'default',
): DualShadow {
  const isRaised = RAISED_VARIANTS.includes(elevation)
  const elev = theme.elevation.neumorphic[elevation]
  const rule = getNeumorphismRule(elevation, state)
  const bg = getSurfaceColor(theme, elevation)

  if (!isRaised || elevation === 'flat') {
    // Flat / inset: no exterior dual-shadow — return zero shadows
    return {
      darkShadow: {
        shadowColor: theme.colors.shadowDark,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
      lightShadow: {
        shadowColor: theme.colors.shadowLight,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
      backgroundColor: bg,
    }
  }

  // Compute offset magnitudes based on the elevation tier
  const offsetMag = Math.round(elev.shadowRadius / 3.5)

  const darkOpacity = scaleByQuality(rule.shadowAlpha, quality)
  const lightOpacity = scaleByQuality(rule.highlightAlpha, quality)
  const radius = quality === 'lite'
    ? Math.min(elev.shadowRadius, 14)
    : elev.shadowRadius

  // pressed state: reduce and invert slightly to simulate depth
  const directionFactor = state === 'pressed' ? 0.4 : 1

  return {
    darkShadow: {
      shadowColor: theme.colors.shadowDark,
      shadowOffset: {
        width: offsetMag * directionFactor,
        height: offsetMag * directionFactor,
      },
      shadowOpacity: Math.max(0, darkOpacity),
      shadowRadius: radius,
      elevation: quality === 'lite' ? Math.min(elev.elevation, 3) : elev.elevation,
    },
    lightShadow: {
      shadowColor: theme.colors.shadowLight,
      shadowOffset: {
        width: -(offsetMag * directionFactor),
        height: -(offsetMag * directionFactor),
      },
      shadowOpacity: quality === 'lite' ? 0 : Math.max(0, lightOpacity),
      shadowRadius: radius,
      elevation: 0,
    },
    backgroundColor: bg,
  }
}
