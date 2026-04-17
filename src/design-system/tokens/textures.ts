import type { DesignSystemTheme } from './colors'

export type NeoTexture = 'none' | 'grain' | 'mesh' | 'frost'

type TextureSpec = {
  overlayColor: string
  borderColor: string
  opacity: number
}

export const textureTokens: Record<DesignSystemTheme, Record<NeoTexture, TextureSpec>> = {
  dark: {
    none: { overlayColor: 'transparent', borderColor: 'transparent', opacity: 0 },
    grain: { overlayColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(188,206,255,0.2)', opacity: 0.22 },
    mesh: { overlayColor: 'rgba(132,160,255,0.14)', borderColor: 'rgba(206,216,255,0.26)', opacity: 0.26 },
    frost: { overlayColor: 'rgba(220,235,255,0.18)', borderColor: 'rgba(255,255,255,0.3)', opacity: 0.3 },
  },
  light: {
    none: { overlayColor: 'transparent', borderColor: 'transparent', opacity: 0 },
    grain: { overlayColor: 'rgba(122,145,194,0.08)', borderColor: 'rgba(102,126,185,0.28)', opacity: 0.2 },
    mesh: { overlayColor: 'rgba(123,149,212,0.14)', borderColor: 'rgba(102,126,185,0.32)', opacity: 0.26 },
    frost: { overlayColor: 'rgba(255,255,255,0.7)', borderColor: 'rgba(137,160,214,0.34)', opacity: 0.3 },
  },
}
