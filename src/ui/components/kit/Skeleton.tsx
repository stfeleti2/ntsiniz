import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { Box } from '../../primitives'
import { useTheme } from '../../theme'

export function Skeleton({ height = 12, width = '100%', radius = 10, style, testID }: { height?: number; width?: any; radius?: number; style?: StyleProp<ViewStyle>; testID?: string }) {
  const { colors } = useTheme()
  return (
    <Box
      testID={testID}
      style={[
        {
          height,
          width,
          borderRadius: radius,
          backgroundColor: colors.neumorphicHighlight,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    />
  )
}
