import React from 'react'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'

export function SessionSummaryPreview() {
  return (
    <Screen scroll>
      <Text preset="h1">Session Complete</Text>
      <Text preset="muted">Your consistency improved today.</Text>
      <Card tone="glow">
        <Text preset="h3">Summary</Text>
        <Text preset="body">Score: 86</Text>
        <Text preset="muted">Attempts: 7</Text>
        <Text preset="muted">Best zone consistency: Strong</Text>
      </Card>
      <Button text="Continue" />
    </Screen>
  )
}
