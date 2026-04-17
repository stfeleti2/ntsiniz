import React from 'react'
import { ViewStyle, StyleProp, type TextInputProps } from 'react-native'
import { Input as PrimitiveInput } from '../../primitives'
import type { SurfaceQuality } from '@/theme/neumorphism/types'

export type InputProps = TextInputProps & {
  value: string
  onChangeText: (v: string) => void
  placeholder?: string
  label?: string
  helperText?: string
  errorText?: string
  leftIcon?: React.ReactNode
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
  disabled,
  quality,
  testID,
  accessibilityLabel,
  style,
  ...inputProps
}: InputProps) {
  return (
    <PrimitiveInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      label={label}
      helperText={helperText}
      errorText={errorText}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      disabled={disabled}
      quality={quality}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      style={style}
      {...inputProps}
    />
  )
}

