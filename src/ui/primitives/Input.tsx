/**
 * Input — an inset neumorphic text-input field.
 *
 * Uses 'inset' elevation to create the sunken-well effect appropriate for text
 * entry. Focus state adds a strong border from colors.borderStrong. Error state
 * uses colors.danger + a helper text prefix for accessibility (not color-only).
 */

import React from 'react'
import {
  TextInput,
  View,
  type ViewStyle,
  type StyleProp,
  type TextInputProps,
} from 'react-native'
import { SurfacePanel } from './SurfacePanel'
import { Stack } from './Stack'
import { Text } from './Text'
import { useTheme } from '@/ui/theme'
import type { SurfaceQuality } from '@/theme/neumorphism/types'

export type InputProps = TextInputProps & {
  value: string
  onChangeText: (v: string) => void
  placeholder?: string
  label?: string
  helperText?: string
  errorText?: string
  /** Node rendered inside the input on the left. */
  leftIcon?: React.ReactNode
  /** Node rendered inside the input on the right. */
  rightIcon?: React.ReactNode
  disabled?: boolean
  quality?: SurfaceQuality
  testID?: string
  accessibilityLabel?: string
  style?: StyleProp<ViewStyle>
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  helperText,
  errorText,
  leftIcon,
  rightIcon,
  disabled = false,
  quality,
  testID,
  accessibilityLabel,
  style,
  ...inputProps
}: InputProps) {
  const { colors, spacing } = useTheme()
  const [focused, setFocused] = React.useState(false)

  const hasError = Boolean(errorText)
  const borderColor = hasError
    ? colors.danger
    : focused
      ? colors.borderStrong
      : undefined // falls back to SurfacePanel's border

  return (
    <Stack gap={6} style={style}>
      {label ? (
        <Text size="sm" weight="semibold">
          {label}
        </Text>
      ) : null}

      <SurfacePanel
        elevation="inset"
        quality={quality}
        testID={testID}
        style={[
          {
            opacity: disabled ? 0.55 : 1,
            borderColor: borderColor as any, // override SurfacePanel border when focused/error
          },
        ]}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: spacing[3],
            paddingVertical: spacing[3],
          }}
        >
          {leftIcon}
          <TextInput
            accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
            editable={!disabled}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{ flex: 1, color: colors.text, fontSize: 16 }}
            {...inputProps}
          />
          {rightIcon}
        </View>
      </SurfacePanel>

      {hasError ? (
        <Stack direction="horizontal" gap={4} align="center">
          {/* Error is conveyed by text AND colour — not colour-only (a11y) */}
          <Text size="sm" tone="danger">
            ⚠ {errorText}
          </Text>
        </Stack>
      ) : helperText ? (
        <Text size="sm" tone="muted">
          {helperText}
        </Text>
      ) : null}
    </Stack>
  )
}
