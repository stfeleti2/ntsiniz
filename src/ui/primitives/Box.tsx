import React from 'react'
import { View, ViewProps, ViewStyle, StyleProp } from 'react-native'

export type BoxProps = ViewProps & {
  style?: StyleProp<ViewStyle>
  testID?: string
  /** Legacy shorthand support used across screens/modules. */
  row?: boolean
  gap?: number
  h?: number
  w?: number
}

export const Box = React.forwardRef<View, BoxProps>(function Box({ style, testID, row, gap, h, w, ...rest }, ref) {
  return (
    <View
      ref={ref}
      testID={testID}
      {...rest}
      style={[
        row ? { flexDirection: 'row' } : null,
        typeof gap === 'number' ? { gap } : null,
        typeof h === 'number' ? { height: h } : null,
        typeof w === 'number' ? { width: w } : null,
        style,
      ]}
    />
  )
})
