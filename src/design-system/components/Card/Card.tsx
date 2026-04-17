import React from 'react'
import { View, ViewStyle, StyleProp } from 'react-native'
import { useTheme, useThemeControls } from '@/theme/provider'
import { resolveCardVariantStyle, type CardState, type CardVariant } from './card.variants'

export type CardProps = {
  variant?: CardVariant
  state?: CardState
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  padding?: number
  testID?: string
}

export function Card({
  variant = 'flat-neo-card',
  state = 'default',
  children,
  style,
  padding = 16,
  testID,
}: CardProps) {
  const theme = useTheme()
  const controls = useThemeControls()
  const resolved = resolveCardVariantStyle({ theme, variant, state, mode: controls.effectiveMode })

  return (
    <View testID={testID} style={[resolved, { padding }, style]}>
      {children}
    </View>
  )
}
