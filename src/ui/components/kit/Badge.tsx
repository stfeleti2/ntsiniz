import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { Box, Text } from '../../primitives'
import { useTheme } from '../../theme'

export function Badge({
  label,
  tone = 'default',
  style,
  testID,
}: {
  label: string
  tone?: 'default' | 'success' | 'danger' | 'warning'
  style?: StyleProp<ViewStyle>
  testID?: string
}) {
  const { colors, radius, spacing } = useTheme()
  const bg =
    tone === 'success'
      ? 'rgba(46, 204, 113, 0.16)'
      : tone === 'danger'
        ? 'rgba(255, 77, 77, 0.16)'
        : tone === 'warning'
          ? 'rgba(255, 176, 32, 0.16)'
          : 'rgba(124, 92, 255, 0.16)'

  const textTone = tone === 'default' ? 'default' : tone

  return (
    <Box
      testID={testID}
      style={[
        {
          alignSelf: 'flex-start',
          paddingHorizontal: spacing[2],
          paddingVertical: spacing[1],
          borderRadius: radius.pill,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Text size="xs" tone={textTone as any} weight="semibold">
        {label}
      </Text>
    </Box>
  )
}
