import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { SurfacePressable, Stack, Text, Icon } from '../../primitives'
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
  const { spacing } = useTheme()
  return (
    <SurfacePressable
      testID={testID}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={title}
      elevation="raised"
      disabled={disabled || !onPress}
      onPress={onPress}
      style={[
        {
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[3],
        },
        style,
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
    </SurfacePressable>
  )
}
