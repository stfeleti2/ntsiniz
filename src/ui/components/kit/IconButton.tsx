import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { SurfacePressable, Icon } from '../../primitives'
import { useTheme } from '../../theme'

export type IconButtonProps = {
  icon: string
  onPress?: () => void
  disabled?: boolean
  size?: number
  style?: StyleProp<ViewStyle>
  testID?: string
  accessibilityLabel?: string
}

export function IconButton({ icon, onPress, disabled, size = 40, style, testID, accessibilityLabel }: IconButtonProps) {
  const { radius } = useTheme()
  return (
    <SurfacePressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? icon}
      disabled={disabled}
      onPress={onPress}
      elevation="raised"
      haptic
      containerStyle={{ alignSelf: 'flex-start' }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Icon name={icon} />
    </SurfacePressable>
  )
}
