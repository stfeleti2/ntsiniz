import React from 'react'
import { TextInput, ViewStyle, StyleProp, type TextInputProps } from 'react-native'
import { Box, Stack, Text } from '../../primitives'
import { useTheme } from '../../theme'

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
  testID,
  accessibilityLabel,
  style,
  ...inputProps
}: InputProps) {
  const { colors, spacing, radius } = useTheme()
  const border = errorText ? colors.danger : colors.border

  return (
    <Stack gap={6} style={style}>
      {label ? <Text size="sm" weight="semibold">{label}</Text> : null}
      <Box
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[3],
          borderRadius: radius[3],
          borderWidth: 1,
          borderColor: border,
          backgroundColor: colors.surface2,
          opacity: disabled ? 0.55 : 1,
        }}
      >
        {leftIcon}
        <TextInput
          testID={testID}
          accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
          editable={!disabled}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          style={{ flex: 1, color: colors.text, fontSize: 16 }}
          {...inputProps}
        />
        {rightIcon}
      </Box>
      {errorText ? <Text size="sm" tone="danger">{errorText}</Text> : helperText ? <Text size="sm" tone="muted">{helperText}</Text> : null}
    </Stack>
  )
}
