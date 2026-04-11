import React from 'react'
import { Text as RNText, type TextStyle } from 'react-native'
import { useTheme } from '@/theme/provider'

const glyphMap = {
  mic: '🎤',
  play: '▶',
  pause: '⏸',
  check: '✓',
  warning: '!',
  info: 'i',
  star: '★',
  close: '✕',
} as const

export type IconName = keyof typeof glyphMap

export type IconProps = {
  name: IconName
  size?: number
  color?: string
  style?: TextStyle
}

export function Icon({ name, size = 18, color, style }: IconProps) {
  const { colors } = useTheme()
  return (
    <RNText
      accessibilityRole="image"
      style={[
        {
          color: color ?? colors.text,
          fontSize: size,
          lineHeight: Math.round(size * 1.15),
          fontWeight: '700',
        },
        style,
      ]}
    >
      {glyphMap[name]}
    </RNText>
  )
}

