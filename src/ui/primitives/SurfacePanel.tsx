/**
 * SurfacePanel — the foundational neumorphic container.
 *
 * # How dual-shadow works in React Native
 * React Native only allows one `shadowColor` per View, so we stack three Views:
 *   1. Outer View — sized by the content View (no background, no overflow clipping)
 *   2. Dark-shadow backing View (absoluteFill) — emits the drop-shadow toward bottom-right
 *   3. Light-shadow backing View (absoluteFill) — emits the highlight toward top-left
 *   4. Content View — normal flow (sets parent size), overflow:'hidden' to clip children
 *
 * On Android: only the dark-shadow View's `elevation` is applied; the light shadow
 * View gets elevation:0 and contributes a subtle tinting via its borderColor.
 *
 * Inset and flat elevations skip the dual-shadow entirely; they rely on background
 * colour + inner border highlight, which reads better at small / input-field sizes.
 */

import React from 'react'
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native'
import { useTheme } from '@/ui/theme'
import { useQuality } from '@/ui/quality/useQuality'
import { getDualShadow } from '@/theme/neumorphism/dualShadow'
import { getNeumorphismRule } from '@/theme/neumorphism/rules'
import { withAlpha } from '@/theme/neumorphism/style'
import type { NeumorphElevation, SurfaceQuality } from '@/theme/neumorphism/types'

/** Variants that get the full dual-shadow treatment. */
const DUAL_SHADOW_VARIANTS: NeumorphElevation[] = ['raised', 'glass']

export type SurfacePanelProps = {
  /** Neumorphic depth level. Defaults to 'raised'. */
  elevation?: NeumorphElevation
  /** Override quality tier (defaults to device quality from useQuality). */
  quality?: SurfaceQuality
  /** Inner padding applied to the content View. */
  padding?: number
  paddingHorizontal?: number
  paddingVertical?: number
  /** Border radius. Defaults to theme.radius[3]. */
  radius?: number
  /** Additional styles applied to the content View. */
  style?: StyleProp<ViewStyle>
  /** Additional styles applied to the outer container. */
  containerStyle?: StyleProp<ViewStyle>
  children?: React.ReactNode
  testID?: string
}

export function SurfacePanel({
  elevation = 'raised',
  quality: qualityProp,
  padding,
  paddingHorizontal,
  paddingVertical,
  radius: radiusProp,
  style,
  containerStyle,
  children,
  testID,
}: SurfacePanelProps) {
  const theme = useTheme()
  const qualityCfg = useQuality()

  // Resolve quality: prop override → device tier → 'full'
  const quality: SurfaceQuality =
    qualityProp ?? (qualityCfg.shadowScale < 0.6 ? 'lite' : 'full')

  const { colors, radius: r } = theme
  const corner = radiusProp ?? r[3]
  const rule = getNeumorphismRule(elevation, 'default')
  const dual = getDualShadow(theme, elevation, quality)
  const isDual = DUAL_SHADOW_VARIANTS.includes(elevation)
  const isInset = elevation === 'inset' || elevation === 'pressed'

  const borderColor = withAlpha(colors.borderStrong, rule.borderAlpha)
  const highlightBorder = isInset
    ? withAlpha(colors.neumorphicHighlight, 0.55)
    : borderColor

  return (
    <View testID={testID} style={[styles.outer, containerStyle]}>
      {/* Dark shadow backing View */}
      {isDual ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: corner,
              backgroundColor: dual.backgroundColor,
              shadowColor: dual.darkShadow.shadowColor,
              shadowOffset: dual.darkShadow.shadowOffset,
              shadowOpacity: dual.darkShadow.shadowOpacity,
              shadowRadius: dual.darkShadow.shadowRadius,
              elevation: dual.darkShadow.elevation,
            },
          ]}
        />
      ) : null}

      {/* Light highlight shadow backing View (iOS only — elevation:0 always) */}
      {isDual && quality === 'full' ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: corner,
              backgroundColor: dual.backgroundColor,
              shadowColor: dual.lightShadow.shadowColor,
              shadowOffset: dual.lightShadow.shadowOffset,
              shadowOpacity: dual.lightShadow.shadowOpacity,
              shadowRadius: dual.lightShadow.shadowRadius,
              elevation: 0,
            },
          ]}
        />
      ) : null}

      {/* Content View */}
      <View
        style={[
          {
            borderRadius: corner,
            backgroundColor: dual.backgroundColor,
            borderWidth: 1,
            borderColor: highlightBorder,
            overflow: 'hidden',
            padding: padding ?? 0,
            paddingHorizontal,
            paddingVertical,
            // Android single-shadow fallback for non-dual variants
            ...(isDual
              ? undefined
              : {
                  shadowColor: colors.shadowDark,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0,
                  shadowRadius: 0,
                  elevation: isInset ? 0 : 1,
                }),
          },
          style,
        ]}
      >
        {children}

        {/* Inner highlight tint for inset/pressed variants */}
        {isInset ? (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: corner,
                borderWidth: 1,
                borderColor: withAlpha(colors.neumorphicHighlight, 0.18),
              },
            ]}
          />
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  outer: {
    // No overflow:hidden — shadows of the backing Views must bleed outward.
  },
})
