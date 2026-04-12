import React from 'react'
import { ActivityIndicator, ViewStyle, StyleProp } from 'react-native'
import { SurfacePressable, Stack, Text } from '../../primitives'
import { useTheme } from '../../theme'

export type ButtonProps = {
  text?: string
  title?: string
  children?: React.ReactNode
  label?: string
  onPress?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft'
  style?: StyleProp<ViewStyle>
  testID?: string
  accessibilityLabel?: string
}

export function Button({
  text,
  title,
  children,
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

  const resolvedLabel =
    label ?? text ?? title ?? (typeof children === 'string' ? children : '')

  const resolvedVariant = variant === 'soft' ? 'secondary' : variant

  const bg =
    resolvedVariant === 'primary'
      ? colors.primary
      : resolvedVariant === 'secondary'
        ? colors.surfaceRaised
        : resolvedVariant === 'danger'
          ? colors.danger
          : colors.surfaceGlass

  const textColor =
    resolvedVariant === 'primary'
      ? colors.highContrastText
      : resolvedVariant === 'danger'
        ? colors.highContrastText
        : colors.text

  return (
    <SurfacePressable
      elevation="raised"
      disabled={disabled || loading}
      haptic
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? resolvedLabel}
      testID={testID}
      style={[
        {
          minHeight: 48,
          paddingVertical: spacing[3],
          paddingHorizontal: spacing[4],
          borderRadius: radius[3],
          backgroundColor: bg,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Stack direction="horizontal" gap={8} align="center" justify="center">
        {loading ? <ActivityIndicator color={textColor} size="small" /> : null}
        <Text weight="semibold" style={{ color: textColor, textAlign: 'center' }}>
          {resolvedLabel}
        </Text>
      </Stack>
    </SurfacePressable>
  )
}


// Backward compatibility: variant-specific button exports for migration from old components
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="primary" />
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="secondary" />
}

export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="ghost" />
}

