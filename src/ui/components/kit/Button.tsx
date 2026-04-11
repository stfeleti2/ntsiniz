import React from 'react'
import { ActivityIndicator, ViewStyle, StyleProp } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { Pressable, Text, Stack } from '../../primitives'
import { useTheme } from '../../theme'

export type ButtonProps = {
  label: string
  onPress?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  style?: StyleProp<ViewStyle>
  testID?: string
  accessibilityLabel?: string
}

export function Button({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const { colors, radius, spacing, elevation: elev } = useTheme()
  const press = useSharedValue(disabled ? 1 : 0)

  React.useEffect(() => {
    if (disabled || loading) {
      press.value = withTiming(0, { duration: 120, easing: Easing.out(Easing.quad) })
    }
  }, [disabled, loading, press])

  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
        ? colors.surfaceRaised
        : variant === 'danger'
          ? colors.danger
          : colors.surfaceGlass

  const borderColor =
    variant === 'primary'
      ? 'rgba(227, 220, 255, 0.64)'
      : variant === 'ghost'
        ? colors.borderStrong
        : variant === 'danger'
          ? 'rgba(255, 196, 208, 0.6)'
          : colors.border

  const textColor =
    variant === 'primary' ? '#100B20' : variant === 'danger' ? '#2C0E18' : colors.text

  const animatedStyle = useAnimatedStyle(() => {
    const pressed = press.value
    const depth = pressed > 0.5 ? elev.neumorphic.pressed : elev.neumorphic.raised
    return {
      transform: [{ translateY: pressed > 0.5 ? 1 : 0 }, { scale: pressed > 0.5 ? 0.995 : 1 }],
      shadowOpacity: depth.shadowOpacity,
      shadowRadius: depth.shadowRadius,
      shadowOffset: depth.shadowOffset,
      elevation: depth.elevation,
    }
  })

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={() => {
        if (disabled || loading) return
        press.value = withTiming(1, { duration: 110, easing: Easing.out(Easing.quad) })
      }}
      onPressOut={() => {
        press.value = withTiming(0, { duration: 150, easing: Easing.out(Easing.cubic) })
      }}
      style={{ opacity: disabled ? 0.52 : 1 }}
    >
      <Animated.View
        style={[
          {
            minHeight: 48,
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[4],
            borderRadius: radius[3],
            backgroundColor: bg,
            borderWidth: 1,
            borderColor,
            justifyContent: 'center',
            shadowColor: colors.shadowDark,
          },
          animatedStyle,
          style as any,
        ]}
      >
        <Stack direction="horizontal" gap={8} align="center" justify="center">
          {loading ? <ActivityIndicator color={textColor} /> : null}
          <Text weight="semibold" style={{ textAlign: 'center', color: textColor }}>
            {label}
          </Text>
        </Stack>
      </Animated.View>
    </Pressable>
  )
}
