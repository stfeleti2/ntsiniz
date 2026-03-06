import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { Box } from './Box'
import { useTheme } from '../theme'

export type StackProps = {
  direction?: 'vertical' | 'horizontal'
  gap?: keyof ReturnType<typeof useTheme>['spacing'] | number
  align?: ViewStyle['alignItems']
  justify?: ViewStyle['justifyContent']
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
  testID?: string
}

export function Stack({
  direction = 'vertical',
  gap = 0,
  align,
  justify,
  style,
  children,
  testID,
}: StackProps) {
  const { spacing } = useTheme()
  const resolvedGap = typeof gap === 'number' ? gap : spacing[gap]
  const isRow = direction === 'horizontal'

  return (
    <Box
      testID={testID}
      style={[
        {
          flexDirection: isRow ? 'row' : 'column',
          gap: resolvedGap,
          alignItems: align,
          justifyContent: justify,
        },
        style,
      ]}
    >
      {children}
    </Box>
  )
}
