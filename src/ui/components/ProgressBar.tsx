import React from 'react'
import { View } from 'react-native'
import { useTheme } from '@/ui/theme'
import type { StyleProp, ViewStyle } from 'react-native'

type Props = {
  pct: number // 0..100
  height?: number
  style?: StyleProp<ViewStyle>
}

export function ProgressBar({ pct, height = 10, style }: Props) {
  const { colors } = useTheme()
  const clamped = Math.max(0, Math.min(100, pct))

  return (
    <View
      style={[
        {
          height,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
        },
        style as any,
      ]}
    >
      <View
        style={{
          height: '100%',
          width: `${clamped}%`,
          backgroundColor: colors.primary,
          opacity: 0.95,
        }}
      />
    </View>
  )
}
