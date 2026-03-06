import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { Pressable, Icon } from '../../primitives'
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
  const { colors, radius } = useTheme()
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? icon}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surface2,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        },
        style as any,
      ]}
    >
      <Icon name={icon} />
    </Pressable>
  )
}
