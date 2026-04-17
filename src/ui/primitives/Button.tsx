/**
 * Button — a labelled neumorphic button with icon support.
 *
 * Built on SurfacePressable for animation; wraps Text and an optional icon.
 * Variants map to different background fill colours:
 *   primary   — filled with theme.colors.primary
 *   secondary — surfaceRaised (borderless feel)
 *   ghost     — surfaceGlass (transparent-ish)
 *   danger    — filled with theme.colors.danger
 */

import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import {
  Button as DesignSystemButton,
  type ButtonVariantKey,
  type ComponentSize,
  type ComponentState,
} from '@/design-system/components/Button'
import type { SurfaceQuality } from '@/theme/neumorphism/types'

export type ButtonVariant = ButtonVariantKey
export type ButtonSize = ComponentSize

export type ButtonProps = {
  label: string
  onPress?: () => void
  onLongPress?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
  state?: ComponentState
  /** Node rendered before the label (icon slot). */
  leftIcon?: React.ReactNode
  /** Node rendered after the label (icon slot). */
  rightIcon?: React.ReactNode
  quality?: SurfaceQuality
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
  return (
    <DesignSystemButton
      label={label}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      loading={loading}
      variant={variant}
      size={size}
      state={state}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      containerStyle={containerStyle}
      style={style}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      testID={testID}
    />
  )
}
