import React from 'react'
import { Text as RNText, TextProps as RNTextProps, TextStyle, StyleProp } from 'react-native'
import { useTheme } from '../theme'

export type TextProps = RNTextProps & {
  tone?: 'default' | 'muted' | 'danger' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  weight?: 'regular' | 'medium' | 'semibold' | 'bold'
  style?: StyleProp<TextStyle>
  testID?: string
}

export function Text({
  tone = 'default',
  size = 'md',
  weight = 'regular',
  style,
  testID,
  ...rest
}: TextProps) {
  const { colors, typography } = useTheme()
  const color =
    tone === 'muted'
      ? colors.muted
      : tone === 'danger'
        ? colors.danger
        : tone === 'success'
          ? colors.success
          : colors.text

  return (
    <RNText
      accessibilityRole={rest.accessibilityRole ?? 'text'}
      testID={testID}
      {...rest}
      style={[
        {
          color,
          fontSize: typography.size[size],
          lineHeight: typography.lineHeight[size],
          fontWeight: typography.weight[weight] as any,
        },
        style,
      ]}
    />
  )
}
