import React from 'react'
import { View } from 'react-native'

const ViewShot = React.forwardRef<any, any>(function ViewShot(props, ref) {
  return <View ref={ref} {...props}>{props.children}</View>
})

export async function captureRef(_ref: unknown, _options?: any) {
  return '/tmp/storybook-capture.png'
}

export default ViewShot