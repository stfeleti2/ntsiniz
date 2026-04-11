import React from 'react'
import { Container } from '@/components/ui/molecules'
import { AppHeader, PlaybackControlPanel, ChartPanel } from '@/components/ui/organisms'

export function PlaybackPreview() {
  return (
    <Container>
      <AppHeader title="Playback" subtitle="Review your take and seek through waveform." />
      <PlaybackControlPanel />
      <ChartPanel />
    </Container>
  )
}
