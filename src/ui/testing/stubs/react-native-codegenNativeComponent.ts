import React from 'react'
import { View } from 'react-native'

export default function codegenNativeComponent() {
  return React.forwardRef<any, any>(function CodegenNativeComponent(props, ref) {
    return React.createElement(View, { ...props, ref }, props.children)
  })
}