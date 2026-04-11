import React, { forwardRef, useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import BottomSheet, { BottomSheetBackdrop, BottomSheetView, type BottomSheetProps } from '@gorhom/bottom-sheet'
import { useTheme } from '@/theme/provider'

export type BottomSheetPanelProps = Omit<BottomSheetProps, 'snapPoints' | 'children'> & {
  snapPoints?: Array<string | number>
  children?: React.ReactNode
  testID?: string
}

export const BottomSheetPanel = forwardRef<BottomSheet, BottomSheetPanelProps>(function BottomSheetPanel(
  { snapPoints = ['45%', '80%'], children, ...rest },
  ref,
) {
  const { colors } = useTheme()
  const points = useMemo(() => snapPoints, [snapPoints])

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={points}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border }}
      handleIndicatorStyle={{ backgroundColor: colors.borderStrong }}
      backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />}
      {...rest}
    >
      <BottomSheetView style={styles.content}>
        <View style={{ flex: 1 }}>{children}</View>
      </BottomSheetView>
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
})

export { BottomSheet }
