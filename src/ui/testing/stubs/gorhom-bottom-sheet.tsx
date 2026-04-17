import React from 'react'
import { View } from 'react-native'

const BottomSheet = React.forwardRef<any, any>(function BottomSheet(props, ref) {
  React.useImperativeHandle(ref, () => ({
    snapToIndex: () => {},
    close: () => {},
    expand: () => {},
  }))

  return <View testID={props.testID ?? 'stub.bottom-sheet'}>{props.children}</View>
})

export const BottomSheetBackdrop = ({ children }: { children?: React.ReactNode }) => <View>{children}</View>
export const BottomSheetView = ({ children }: { children?: React.ReactNode }) => <View>{children}</View>

export default BottomSheet

