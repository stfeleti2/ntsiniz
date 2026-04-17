import type { ViewStyle } from 'react-native'
import type { Theme } from '@/theme/provider'
import type { SurfaceVariant } from '@/theme/tokens'
import { getNeumorphismRule } from './rules'
import type { NeumorphismState, SurfaceQuality } from './types'

// Re-export so callers that imported from this file continue to work.
export type { SurfaceQuality }

export type NeumorphicSurfaceOptions = {
  variant?: SurfaceVariant
  state?: NeumorphismState
  quality?: SurfaceQuality
  borderWidth?: number
  radius?: number
  padding?: number
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return `rgba(0,0,0,${alpha})`
  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export function withAlpha(color: string, alpha: number) {
  if (color.startsWith('rgba(')) {
    return color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/, `rgba($1, $2, $3, ${alpha})`)
  }
  if (color.startsWith('rgb(')) {
    return color.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, `rgba($1, $2, $3, ${alpha})`)
  }
  if (color.startsWith('#')) return hexToRgba(color, alpha)
  return color
}

export function getSurfaceColor(theme: Theme, variant: SurfaceVariant) {
  const { colors } = theme
  if (variant === 'raised') return colors.surfaceRaised
  if (variant === 'inset') return colors.surfaceInset
  if (variant === 'pressed') return colors.surfaceInset
  if (variant === 'glass') return colors.surfaceGlass
  return colors.surfaceBase
}

export function getNeumorphicSurfaceStyle(theme: Theme, options: NeumorphicSurfaceOptions = {}): ViewStyle {
  const variant = options.variant ?? 'flat'
  const state = options.state ?? 'default'
  const quality = options.quality ?? 'full'
  const rule = getNeumorphismRule(variant, state)
  const baseElevation = theme.elevation.neumorphic[variant]
  const effectiveShadowOpacity = quality === 'lite' ? Math.min(baseElevation.shadowOpacity, 0.16) : baseElevation.shadowOpacity

  return {
    backgroundColor: getSurfaceColor(theme, variant),
    borderWidth: options.borderWidth ?? 1,
    borderRadius: options.radius ?? theme.radius[3],
    borderColor: withAlpha(theme.colors.borderStrong, rule.borderAlpha),
    padding: options.padding ?? 0,
    shadowColor: withAlpha(theme.colors.shadowDark, Math.max(0.1, rule.shadowAlpha)),
    shadowOffset: baseElevation.shadowOffset,
    shadowRadius: quality === 'lite' ? Math.min(baseElevation.shadowRadius, 12) : baseElevation.shadowRadius,
    shadowOpacity: effectiveShadowOpacity,
    elevation: quality === 'lite' ? Math.min(baseElevation.elevation, 2) : baseElevation.elevation,
  }
}
