import React from 'react'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Stack } from '@/ui'

export function DrillPreview() {
  return (
    <Screen scroll>
      <Text preset="h1">Pitch Match Drill</Text>
      <Text preset="muted">Stay centered in the target note.</Text>
      <Card tone="elevated">
        <Text preset="h3">Drill Controls</Text>
        <Text preset="muted">Live monitoring ready</Text>
        <Stack direction="horizontal" gap={8} style={{ flexWrap: 'wrap' }}>
          <Button text="Start" />
          <Button text="Pause" variant="secondary" />
        </Stack>
      </Card>
      <Card tone="default">
        <Text preset="h3">Pitch trace</Text>
        <Text preset="muted">Real-time stability chart surface.</Text>
      </Card>
    </Screen>
  )
}
