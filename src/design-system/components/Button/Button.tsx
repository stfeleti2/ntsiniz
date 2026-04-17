import React from 'react'
import { ActivityIndicator, ViewStyle, StyleProp } from 'react-native'
import { SurfacePressable } from '@/ui/primitives/SurfacePressable'
import { Text } from '@/ui/primitives/Text'
import { useTheme, useThemeControls } from '@/theme/provider'
import {
  resolveButtonVariantStyle,
  type ButtonVariantKey,
  type ComponentSize,
  type ComponentState,
} from './button.variants'

export type ButtonProps = {
  label: string
  onPress?: () => void
  onLongPress?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: ButtonVariantKey
  size?: ComponentSize
  state?: ComponentState
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  style?: StyleProp<ViewStyle>
  containerStyle?: StyleProp<ViewStyle>
  accessibilityLabel?: string
  accessibilityHint?: string
  testID?: string
}

export function Button({
  label,
  onPress,
  onLongPress,
  disabled,
  loading,
  variant = 'primary-light-rounded',
  size = 'md',
  state = 'default',
  leftIcon,
  rightIcon,
  style,
  containerStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const theme = useTheme()
  const controls = useThemeControls()
  const mode = controls.effectiveMode

  const resolvedState: ComponentState = disabled || loading ? 'disabled' : state
  const resolved = resolveButtonVariantStyle({
    theme,
    variant,
    size,
    state: resolvedState,
    mode,
  })

  const textColor =
    resolved.labelColorToken === 'highContrastText'
      ? theme.colors.highContrastText
      : resolved.labelColorToken === 'primary'
        ? theme.colors.primary
        : resolved.labelColorToken === 'secondary'
          ? theme.colors.secondary
          : theme.colors.text

  return (
    <SurfacePressable
      elevation={variant === 'active-led-button' ? 'glass' : 'raised'}
      disabled={disabled || loading}
      haptic
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      testID={testID}
      containerStyle={containerStyle}
      style={[resolved.container, style]}
    >
      {leftIcon}
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text weight="semibold" style={{ color: textColor, textAlign: 'center' }}>
          {label}
        </Text>
      )}
      {rightIcon}
    </SurfacePressable>
  )
}
