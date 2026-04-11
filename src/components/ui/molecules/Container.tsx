import React from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'
import { useTheme } from '@/theme/provider'

export function Container({
  children,
  style,
  testID,
}: {
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  testID?: string
}) {
  const { spacing } = useTheme()
  return (
    <View
      testID={testID}
      style={[
        {
          gap: spacing[3],
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[4],
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

