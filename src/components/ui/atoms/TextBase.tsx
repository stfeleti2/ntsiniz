import React from 'react'
import { Text as RNText, type StyleProp, type TextProps as RNTextProps, type TextStyle } from 'react-native'
import { useTheme } from '@/theme/provider'

export type TextTone = 'default' | 'muted' | 'danger' | 'success' | 'warning'
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold'

export type AppTextProps = RNTextProps & {
  tone?: TextTone
  size?: TextSize
  weight?: TextWeight
  style?: StyleProp<TextStyle>
}

function resolveToneColor(tone: TextTone, palette: ReturnType<typeof useTheme>['colors']) {
  if (tone === 'muted') return palette.textMuted
  if (tone === 'danger') return palette.danger
  if (tone === 'success') return palette.success
  if (tone === 'warning') return palette.warning
  return palette.text
}

export function AppText({
  tone = 'default',
  size = 'md',
  weight = 'regular',
  style,
  children,
  ...rest
}: AppTextProps) {
  const { colors, typography } = useTheme()

  return (
    <RNText
      {...rest}
      style={[
        {
          color: resolveToneColor(tone, colors),
          fontSize: typography.size[size],
          lineHeight: typography.lineHeight[size],
          fontWeight: typography.weight[weight] as TextStyle['fontWeight'],
        },
        style,
      ]}
    >
      {children}
    </RNText>
  )
}

