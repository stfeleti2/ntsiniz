import React from 'react'
import type { ViewStyle, StyleProp } from 'react-native'
import { Box, Stack, Text } from '@/ui/primitives'
import { Button } from '@/ui/components/Button'
import { WaveformSeek, WaveformSkeleton } from '@/ui/patterns'
import { t } from '@/app/i18n'

export type WaveformPlayerModuleProps = {
  peaks: number[]
  loading?: boolean
  progress: number
  progressLabel: string
  isPlaying: boolean
  onToggle?: () => void
  onRestart?: () => void
  onSeek?: (p: number) => void
  disabled?: boolean
  height?: number
  testID?: string
  style?: StyleProp<ViewStyle>
}

/**
 * Playback UI block: waveform + progress + controls.
 * Pure UI (no audio business logic). Wire it in screens/controllers.
 */
export function WaveformPlayerModule({
  peaks,
  loading,
  progress,
  progressLabel,
  isPlaying,
  onToggle,
  onRestart,
  onSeek,
  disabled,
  height = 110,
  testID,
  style,
}: WaveformPlayerModuleProps) {
  const canSeek = !disabled && typeof onSeek === 'function'
  const canToggle = !disabled && typeof onToggle === 'function'
  const canRestart = !disabled && typeof onRestart === 'function'

  return (
    <Box testID={testID} style={style}>
      {loading && (!peaks || !peaks.length) ? (
        <WaveformSkeleton bars={Math.max(24, Math.min(120, peaks?.length || 96))} height={height} testID={testID ? `${testID}.loading` : undefined} />
      ) : (
        <WaveformSeek
          peaks={peaks}
          progress={progress}
          onSeek={canSeek ? onSeek : undefined}
          disabled={!canSeek}
          height={height}
          testID={testID ? `${testID}.waveform` : undefined}
        />
      )}

      <Box style={{ height: 10 }} />
      <Text tone="muted">{progressLabel}</Text>

      <Box style={{ height: 12 }} />
      <Stack direction="horizontal" gap={10}>
        <Button
          text={isPlaying ? t('common.pause') : t('common.play')}
          variant="primary"
          onPress={canToggle ? onToggle : undefined}
          testID={testID ? `${testID}.toggle` : undefined}
        />
        <Button
          text={t('playback.restart')}
          variant="secondary"
          onPress={canRestart ? onRestart : undefined}
          testID={testID ? `${testID}.restart` : undefined}
        />
      </Stack>
    </Box>
  )
}
