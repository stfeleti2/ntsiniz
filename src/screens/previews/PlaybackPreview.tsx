import React from 'react'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Stack } from '@/ui'

export function PlaybackPreview() {
  return (
    <Screen scroll>
      <Text preset="h1">Playback</Text>
      <Text preset="muted">Review your take and seek through waveform.</Text>
      <Card tone="elevated">
        <Text preset="h3">Playback controls</Text>
        <Text preset="muted">00:14 / 00:56</Text>
        <Stack direction="horizontal" gap={8} style={{ flexWrap: 'wrap' }}>
          <Button text="Play / Pause" />
          <Button text="Restart" variant="ghost" />
        </Stack>
      </Card>
      <Card tone="default">
        <Text preset="h3">Waveform</Text>
        <Text preset="muted">Preview waveform module surface.</Text>
      </Card>
    </Screen>
  )
}
