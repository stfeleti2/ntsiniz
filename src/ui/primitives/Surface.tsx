import React from 'react'
import { StyleSheet, ViewStyle, StyleProp } from 'react-native'
import { Box } from './Box'
import { useTheme } from '../theme'
import type { AccentRole, SurfaceDepth } from '../tokens'

export type SurfaceProps = {
  tone?: 'default' | 'raised' | 'transparent' | 'glass'
  depth?: SurfaceDepth
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
  accentRole,
  padding = 0,
  radius,
  style,
  children,
  testID,
}: SurfaceProps) {
  const { colors, elevation: elev, radius: r } = useTheme()
  const corner = radius ?? r[2]
  const resolvedDepth: SurfaceDepth =
    depth ?? (tone === 'raised' ? 'raised' : tone === 'glass' ? 'raised' : tone === 'transparent' ? 'flat' : 'flat')

  const accentBorder =
    accentRole === 'primary'
      ? colors.accentLavender
      : accentRole === 'secondary'
        ? colors.accentCyan
        : accentRole === 'success'
          ? colors.success
          : accentRole === 'warning'
            ? colors.warning
            : colors.border

  const bg =
    tone === 'transparent'
      ? 'transparent'
      : tone === 'glass'
        ? colors.surfaceGlass
        : resolvedDepth === 'inset'
          ? colors.surfaceInset
          : resolvedDepth === 'raised'
            ? colors.surfaceRaised
            : colors.surfaceBase

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
          ...(shadow as any),
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
        <Box pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: corner, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' }]} />
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
