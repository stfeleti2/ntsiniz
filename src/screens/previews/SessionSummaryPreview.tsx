import React from 'react'
import { Container } from '@/components/ui/molecules'
import { AppHeader, SessionSummaryPanel } from '@/components/ui/organisms'

export function SessionSummaryPreview() {
  return (
    <Container>
      <AppHeader title="Session Complete" subtitle="Your consistency improved today." />
      <SessionSummaryPanel score={86} />
    </Container>
  )
}
