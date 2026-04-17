import React from 'react'
import { View } from 'react-native'

export const SafeAreaProvider = ({ children }: { children?: React.ReactNode }) => <>{children}</>

export const SafeAreaView = React.forwardRef<any, any>(function SafeAreaView(props, ref) {
  return <View ref={ref} {...props}>{props.children}</View>
})

export function useSafeAreaInsets() {
  return { top: 0, right: 0, bottom: 0, left: 0 }
}

export default {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
}