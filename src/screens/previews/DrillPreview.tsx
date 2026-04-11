import React from 'react'
import { Container } from '@/components/ui/molecules'
import { AppHeader, DrillControlPanel, ChartPanel } from '@/components/ui/organisms'

export function DrillPreview() {
  return (
    <Container>
      <AppHeader title="Pitch Match Drill" subtitle="Stay centered in the target note." />
      <DrillControlPanel status="Live monitoring ready" />
      <ChartPanel />
    </Container>
  )
}
