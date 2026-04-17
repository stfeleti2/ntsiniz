import type { Theme } from '@/theme/provider/theme'
import type { NeoTexture } from './textures'
import { resolveNeoLayerShadow } from './shadows'

export type NeoSurfaceVariant = 'solid' | 'layered' | 'textured'

type SurfaceConfig = {
  backgroundColor: string
  borderColor: string
  texture: NeoTexture
  shadow: ReturnType<typeof resolveNeoLayerShadow>
}

export function resolveNeoSurfaceStyle(theme: Theme, variant: NeoSurfaceVariant): SurfaceConfig {
  if (variant === 'layered') {
    return {
      backgroundColor: theme.colors.surfaceRaised,
      borderColor: theme.colors.borderStrong,
      texture: 'mesh',
      shadow: resolveNeoLayerShadow(theme, 'deep'),
    }
  }

  if (variant === 'textured') {
    return {
      backgroundColor: theme.colors.surfaceGlass,
      borderColor: theme.colors.borderStrong,
      texture: 'grain',
      shadow: resolveNeoLayerShadow(theme, 'medium'),
    }
  }

  return {
    backgroundColor: theme.colors.surfaceBase,
    borderColor: theme.colors.border,
    texture: 'none',
    shadow: resolveNeoLayerShadow(theme, 'subtle'),
  }
}
