/**
 * SurfacePressable — a Reanimated-driven pressable neumorphic surface.
 *
 * On press-in: shadows animate from 'raised' → 'pressed' (element sinks inward).
 * On press-out: shadows animate back to 'raised'.
 * Disabled: elevation collapses to 'flat' with reduced opacity.
 *
 * The underlying dual-shadow layer uses two absolutely-positioned backing Views
 * whose shadow props are animated independently via Reanimated shared values.
 */

import React from 'react'
import {
  StyleSheet,
  View,
  Pressable,
  type PressableProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native'
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useTheme } from '@/ui/theme'
import { useQuality } from '@/ui/quality/useQuality'
import { getDualShadow } from '@/theme/neumorphism/dualShadow'
import { getNeumorphismRule } from '@/theme/neumorphism/rules'
import { withAlpha } from '@/theme/neumorphism/style'
import type { NeumorphElevation, SurfaceQuality } from '@/theme/neumorphism/types'

const DUAL_SHADOW_VARIANTS: NeumorphElevation[] = ['raised', 'glass']

export type SurfacePressableProps = {
  onPress?: () => void
  onLongPress?: () => void
  disabled?: boolean
  haptic?: boolean
  elevation?: NeumorphElevation
  quality?: SurfaceQuality
  padding?: number
  paddingHorizontal?: number
  paddingVertical?: number
  radius?: number
  style?: StyleProp<ViewStyle>
  containerStyle?: StyleProp<ViewStyle>
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityRole?: PressableProps['accessibilityRole']
  testID?: string
  children?: React.ReactNode
}

const PRESS_DURATION = { in: 110, out: 160 } as const

export function SurfacePressable({
  onPress,
  onLongPress,
  disabled = false,
  haptic = false,
  elevation = 'raised',
  quality: qualityProp,
  padding,
  paddingHorizontal,
  paddingVertical,
  radius: radiusProp,
  style,
  containerStyle,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  testID,
  children,
}: SurfacePressableProps) {
  const theme = useTheme()
  const qualityCfg = useQuality()
  const quality: SurfaceQuality =
    qualityProp ?? (qualityCfg.shadowScale < 0.6 ? 'lite' : 'full')

  const { colors, radius: r } = theme
  const corner = radiusProp ?? r[3]

  // Pre-compute shadow data for both states
  const raisedDual = getDualShadow(theme, elevation, quality, 'default')
  const pressedDual = getDualShadow(theme, elevation, quality, 'pressed')
  const disabledRule = getNeumorphismRule(elevation, 'disabled')

  const isDual = DUAL_SHADOW_VARIANTS.includes(elevation)

  // Shared value: 0 = resting, 1 = pressed
  const pressValue = useSharedValue(disabled ? 0.5 : 0)

  React.useEffect(() => {
    pressValue.value = withTiming(disabled ? 0.5 : 0, {
      duration: PRESS_DURATION.out,
      easing: Easing.out(Easing.quad),
    })
  }, [disabled, pressValue])

  const raisedBorder = withAlpha(
    colors.borderStrong,
    getNeumorphismRule(elevation, 'default').borderAlpha,
  )

  // Animated dark shadow View
  const darkShadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(
      pressValue.value,
      [0, 0.5, 1],
      [raisedDual.darkShadow.shadowOpacity, disabledRule.shadowAlpha * 0.5, pressedDual.darkShadow.shadowOpacity],
    ),
    shadowRadius: interpolate(
      pressValue.value,
      [0, 0.5, 1],
      [raisedDual.darkShadow.shadowRadius, 6, pressedDual.darkShadow.shadowRadius],
    ),
    shadowOffset: {
      width: interpolate(
        pressValue.value,
        [0, 1],
        [raisedDual.darkShadow.shadowOffset.width, pressedDual.darkShadow.shadowOffset.width],
      ),
      height: interpolate(
        pressValue.value,
        [0, 1],
        [raisedDual.darkShadow.shadowOffset.height, pressedDual.darkShadow.shadowOffset.height],
      ),
    },
    elevation: interpolate(pressValue.value, [0, 0.5, 1], [raisedDual.darkShadow.elevation, 1, pressedDual.darkShadow.elevation]),
  }))

  // Animated light shadow View
  const lightShadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(
      pressValue.value,
      [0, 0.5, 1],
      [raisedDual.lightShadow.shadowOpacity, 0, pressedDual.lightShadow.shadowOpacity],
    ),
    shadowRadius: interpolate(
      pressValue.value,
      [0, 1],
      [raisedDual.lightShadow.shadowRadius, pressedDual.lightShadow.shadowRadius],
    ),
    shadowOffset: {
      width: interpolate(
        pressValue.value,
        [0, 1],
        [raisedDual.lightShadow.shadowOffset.width, pressedDual.lightShadow.shadowOffset.width],
      ),
      height: interpolate(
        pressValue.value,
        [0, 1],
        [raisedDual.lightShadow.shadowOffset.height, pressedDual.lightShadow.shadowOffset.height],
      ),
    },
  }))

  // Subtle scale + translate for tactile feel
  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(pressValue.value, [0, 0.5, 1], [1, 1, 0.995]) },
      { translateY: interpolate(pressValue.value, [0, 0.5, 1], [0, 0, 1]) },
    ],
    opacity: interpolate(pressValue.value, [0, 0.5, 1], [1, disabled ? 0.42 : 0.88, 1]),
  }))

  const handlePressIn = () => {
    if (disabled) return
    pressValue.value = withTiming(1, { duration: PRESS_DURATION.in, easing: Easing.out(Easing.quad) })
  }

  const handlePressOut = () => {
    pressValue.value = withTiming(0, { duration: PRESS_DURATION.out, easing: Easing.out(Easing.cubic) })
  }

  const handlePress = () => {
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    onPress?.()
  }

  return (
    <View style={containerStyle}>
      {/* Dark shadow backing */}
      {isDual ? (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: corner,
              backgroundColor: raisedDual.backgroundColor,
              shadowColor: raisedDual.darkShadow.shadowColor,
            },
            darkShadowStyle,
          ]}
        />
      ) : null}

      {/* Light shadow backing (iOS, quality=full only) */}
      {isDual && quality === 'full' ? (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: corner,
              backgroundColor: raisedDual.backgroundColor,
              shadowColor: raisedDual.lightShadow.shadowColor,
              elevation: 0,
            },
            lightShadowStyle,
          ]}
        />
      ) : null}

      <Pressable
        testID={testID}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        onLongPress={onLongPress}
      >
        <Animated.View
          style={[
            {
              borderRadius: corner,
              backgroundColor: raisedDual.backgroundColor,
              borderWidth: 1,
              borderColor: raisedBorder,
              overflow: 'hidden',
              padding: padding ?? 0,
              paddingHorizontal,
              paddingVertical,
            },
            contentStyle,
            style,
          ]}
        >
          {children}
        </Animated.View>
      </Pressable>
    </View>
  )
}
