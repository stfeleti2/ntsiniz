import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { Box, Stack, Text } from '../primitives'
import { Button } from '../components/kit'
import { useTheme } from '../theme'
import { t } from '@/app/i18n'

export function PlaybackOverlay({
  isPlaying,
  progressLabel,
  onToggle,
  testID,
  style,
}: {
  isPlaying: boolean
  progressLabel: string
  onToggle?: () => void
  testID?: string
  style?: StyleProp<ViewStyle>
}) {
  const { colors, spacing, radius } = useTheme()
  return (
    <Box
      testID={testID}
      style={[
        {
          position: 'absolute',
          left: spacing[4],
          right: spacing[4],
          bottom: spacing[6],
          backgroundColor: 'rgba(20,20,33,0.92)',
          borderRadius: radius[4],
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing[4],
        },
        style,
      ]}
    >
      <Stack direction="horizontal" align="center" justify="space-between">
        <Stack gap={2}>
          <Text weight="bold">{t('common.playback')}</Text>
          <Text tone="muted" size="sm">
            {progressLabel}
          </Text>
        </Stack>
        <Button
          testID={testID ? `${testID}.toggle` : undefined}
          label={isPlaying ? t('common.pause') : t('common.play')}
          onPress={onToggle}
          disabled={!onToggle}
          variant="secondary"
        />
      </Stack>
    </Box>
  )
}
