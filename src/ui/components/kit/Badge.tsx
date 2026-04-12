import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { Box, Text } from '../../primitives'
import { useTheme } from '../../theme'
import { withAlpha } from '@/theme/neumorphism/style'

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
      ? withAlpha(colors.success, 0.16)
      : tone === 'danger'
        ? withAlpha(colors.danger, 0.16)
        : tone === 'warning'
          ? withAlpha(colors.warning, 0.16)
          : withAlpha(colors.primary, 0.16)

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
