import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { Box } from './Box'
import { useTheme } from '../theme'

export type SurfaceProps = {
  tone?: 'default' | 'raised' | 'transparent'
  padding?: number
  radius?: number
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
  testID?: string
}

export function Surface({ tone = 'default', padding = 0, radius, style, children, testID }: SurfaceProps) {
  const { colors, elevation: elev, radius: r } = useTheme()
  const bg = tone === 'transparent' ? 'transparent' : tone === 'raised' ? colors.surface2 : colors.surface
  const shadow = tone === 'raised' ? elev[1] : elev[0]

  return (
    <Box
      testID={testID}
      style={[
        {
          backgroundColor: bg,
          padding,
          borderRadius: radius ?? r[2],
          borderWidth: tone === 'transparent' ? 0 : 1,
          borderColor: colors.border,
          shadowColor: '#000',
          ...(shadow as any),
        },
        style,
      ]}
    >
      {children}
    </Box>
  )
}
