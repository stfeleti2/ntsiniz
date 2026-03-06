import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { Box, Stack, Text } from '../primitives'
import { useTheme } from '../theme'
import { t } from '@/app/i18n'

export function RecorderHUD({
  elapsedLabel,
  levelLabel = t('dev.level'),
  testID,
  style,
}: {
  elapsedLabel: string
  levelLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
}) {
  const { colors, spacing, radius, zIndex } = useTheme()
  return (
    <Box
      testID={testID}
      style={[
        {
          position: 'absolute',
          top: spacing[6],
          left: spacing[4],
          right: spacing[4],
          zIndex: zIndex.overlay,
          borderRadius: radius[4],
          backgroundColor: 'rgba(20,20,33,0.85)',
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing[3],
        },
        style,
      ]}
    >
      <Stack direction="horizontal" justify="space-between" align="center">
        <Text weight="bold">{elapsedLabel}</Text>
        <Stack direction="horizontal" gap={8} align="center">
          <Text tone="muted" size="sm">
            {levelLabel}
          </Text>
          <Box
            style={{
              width: 60,
              height: 8,
              borderRadius: radius.pill,
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
        </Stack>
      </Stack>
    </Box>
  )
}
