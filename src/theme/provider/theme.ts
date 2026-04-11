import {
  breakpoints,
  darkColors,
  elevation,
  lightColors,
  motion as baseMotion,
  radius,
  spacing,
  typography,
  zIndex,
  shadows,
} from '@/theme/tokens'

export type ThemeMode = 'dark' | 'light' | 'system'
export type MotionPreset = 'normal' | 'snappy' | 'calm'

function motionScaleForPreset(preset: MotionPreset) {
  if (preset === 'snappy') return 0.82
  if (preset === 'calm') return 1.24
  return 1
}

function buildMotion(preset: MotionPreset, reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      fast: 0,
      normal: 0,
      slow: 0,
    } as const
  }

  const scale = motionScaleForPreset(preset)
  return {
    fast: Math.round(baseMotion.fast * scale),
    normal: Math.round(baseMotion.normal * scale),
    slow: Math.round(baseMotion.slow * scale),
  } as const
}

export function buildTheme(options?: {
  mode?: Exclude<ThemeMode, 'system'>
  motionPreset?: MotionPreset
  reducedMotion?: boolean
}) {
  const mode = options?.mode ?? 'dark'
  const colors = mode === 'light' ? lightColors : darkColors
  const motion = buildMotion(options?.motionPreset ?? 'normal', !!options?.reducedMotion)

  return {
    colors,
    spacing,
    typography,
    radius,
    elevation,
    motion,
    zIndex,
    breakpoints,
    shadows,
  } as const
}

export const theme = buildTheme()
export type Theme = typeof theme
