import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { Surface } from '../../primitives'

export function Card({ children, style, testID }: { children?: React.ReactNode; style?: StyleProp<ViewStyle>; testID?: string }) {
  return (
    <Surface testID={testID} tone="raised" padding={16} style={style}>
      {children}
    </Surface>
  )
}
