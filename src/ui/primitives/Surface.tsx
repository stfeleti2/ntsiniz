import React from 'react'
import { StyleSheet, ViewStyle, StyleProp } from 'react-native'
import { Box } from './Box'
import { useTheme } from '../theme'
import type { AccentRole, SurfaceDepth } from '../tokens'
import { resolveNeoSurfaceStyle, type NeoSurfaceVariant } from '@/design-system/tokens/surfaces'
import { textureTokens } from '@/design-system/tokens/textures'

export type SurfaceProps = {
  tone?: 'default' | 'raised' | 'transparent' | 'glass'
  depth?: SurfaceDepth
  neoVariant?: NeoSurfaceVariant
  accentRole?: AccentRole
  padding?: number
  radius?: number
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
  testID?: string
}

export function Surface({
  tone = 'default',
  depth,
  neoVariant = 'solid',
  accentRole,
  padding = 0,
  radius,
  style,
  children,
  testID,
}: SurfaceProps) {
  const theme = useTheme()
  const { colors, elevation: elev, radius: r } = theme
  const corner = radius ?? r[2]
  const mode = colors.bg.toLowerCase() === '#070911' ? 'dark' : 'light'
  const neoSurface = resolveNeoSurfaceStyle(theme, neoVariant)
  const texture = textureTokens[mode][neoSurface.texture]
  const resolvedDepth: SurfaceDepth =
    depth ?? (tone === 'raised' ? 'raised' : tone === 'glass' ? 'raised' : tone === 'transparent' ? 'flat' : 'flat')

  const accentBorder =
    tone === 'default' || tone === 'raised'
      ? neoSurface.borderColor
      : accentRole === 'primary'
      ? colors.accentLavender
      : accentRole === 'secondary'
        ? colors.accentCyan
        : accentRole === 'success'
          ? colors.success
          : accentRole === 'warning'
            ? colors.warning
            : colors.border

  const baseBg =
    tone === 'transparent'
      ? 'transparent'
      : tone === 'glass'
        ? colors.surfaceGlass
        : resolvedDepth === 'inset'
          ? colors.surfaceInset
          : resolvedDepth === 'raised'
            ? colors.surfaceRaised
            : colors.surfaceBase

  const bg = tone === 'default' || tone === 'raised' ? neoSurface.backgroundColor : baseBg

  const shadow =
    tone === 'transparent'
      ? elev[0]
      : resolvedDepth === 'raised'
        ? elev.neumorphic.raised
        : resolvedDepth === 'pressed'
          ? elev.neumorphic.pressed
          : resolvedDepth === 'inset'
            ? elev.neumorphic.inset
            : tone === 'glass'
              ? elev.neumorphic.glass
              : elev.neumorphic.flat

  return (
    <Box
      testID={testID}
      style={[
        {
          backgroundColor: bg,
          padding,
          borderRadius: corner,
          borderWidth: tone === 'transparent' ? 0 : 1,
          borderColor: tone === 'transparent' ? 'transparent' : accentBorder,
          overflow: tone === 'transparent' ? 'visible' : 'hidden',
          shadowColor: colors.shadowDark,
          ...((tone === 'default' || tone === 'raised' ? neoSurface.shadow : shadow) as any),
        },
        tone === 'glass'
          ? {
              borderColor: colors.borderStrong,
            }
          : null,
        style,
      ]}
    >
      {children}
      {tone !== 'transparent' ? (
        <Box
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: corner,
              borderWidth: 1,
              borderColor: texture.borderColor,
              opacity: texture.opacity,
              backgroundColor: texture.overlayColor,
            },
          ]}
        />
      ) : null}
      {resolvedDepth === 'inset' ? (
        <Box
          pointerEvents="none"
          style={[
            styles.insetShadow,
            {
              borderRadius: corner,
              shadowColor: colors.shadowDark,
            },
          ]}
        />
      ) : null}
    </Box>
  )
}

const styles = StyleSheet.create({
  insetShadow: {
    ...StyleSheet.absoluteFillObject,
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
})
