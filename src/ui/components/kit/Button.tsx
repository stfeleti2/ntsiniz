import React from 'react'
import { ActivityIndicator, ViewStyle, StyleProp } from 'react-native'
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
  const { colors, radius, spacing } = useTheme()

  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
        ? colors.surface2
        : variant === 'danger'
          ? colors.danger
          : 'transparent'

  const borderColor = variant === 'ghost' ? colors.border : 'transparent'

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingVertical: spacing[3],
          paddingHorizontal: spacing[4],
          borderRadius: radius[3],
          backgroundColor: bg,
          borderWidth: borderColor === 'transparent' ? 0 : 1,
          borderColor,
          opacity: disabled ? 0.55 : pressed ? 0.9 : 1,
        },
        style as any,
      ]}
    >
      <Stack direction="horizontal" gap={8} align="center" justify="center">
        {loading ? <ActivityIndicator /> : null}
        <Text weight="semibold" style={{ textAlign: 'center' }}>
          {label}
        </Text>
      </Stack>
    </Pressable>
  )
}
