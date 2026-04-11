import React from 'react'
import { View } from 'react-native'
import { Card } from '@/components/ui/molecules/Card'
import { Heading } from '@/components/ui/atoms/Heading'
import { BodyText } from '@/components/ui/atoms/BodyText'
import { PrimaryButton, GhostButton } from '@/components/ui/atoms/Buttons'
import { useTheme } from '@/theme/provider'

export function PlaybackControlPanel({
  elapsed = '00:14 / 00:56',
  onPlay,
  onRestart,
}: {
  elapsed?: string
  onPlay?: () => void
  onRestart?: () => void
}) {
  const { spacing } = useTheme()

  return (
    <Card>
      <View style={{ gap: spacing[2] }}>
        <Heading level={3}>Playback</Heading>
        <BodyText tone="muted">{elapsed}</BodyText>
        <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
          <PrimaryButton label="Play / Pause" onPress={onPlay} />
          <GhostButton label="Restart" onPress={onRestart} />
        </View>
      </View>
    </Card>
  )
}
