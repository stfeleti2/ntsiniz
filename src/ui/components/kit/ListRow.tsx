import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { Pressable, Stack, Text, Icon } from '../../primitives'
import { useTheme } from '../../theme'

export type ListRowProps = {
  title: string
  subtitle?: string
  leftIcon?: string
  right?: React.ReactNode
  onPress?: () => void
  disabled?: boolean
  testID?: string
  style?: StyleProp<ViewStyle>
}

export function ListRow({ title, subtitle, leftIcon, right, onPress, disabled, testID, style }: ListRowProps) {
  const { colors, spacing, radius } = useTheme()
  return (
    <Pressable
      testID={testID}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={title}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[3],
          borderRadius: radius[3],
          backgroundColor: colors.surface2,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
        },
        style as any,
      ]}
    >
      <Stack direction="horizontal" gap={12} align="center" justify="space-between">
        <Stack direction="horizontal" gap={12} align="center" style={{ flex: 1 }}>
          {leftIcon ? <Icon name={leftIcon} /> : null}
          <Stack gap={2} style={{ flex: 1 }}>
            <Text weight="semibold">{title}</Text>
            {subtitle ? <Text size="sm" tone="muted">{subtitle}</Text> : null}
          </Stack>
        </Stack>
        {right ?? (onPress ? <Icon name={'> '} /> : null)}
      </Stack>
    </Pressable>
  )
}
