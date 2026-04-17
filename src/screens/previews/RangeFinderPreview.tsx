import React from 'react'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'

export function RangeFinderPreview() {
  return (
    <Screen scroll>
      <Text preset="h2">Range Finder</Text>
      <Text preset="muted">Find your stable singing range before harder drills.</Text>
      <Card tone="elevated">
        <Text preset="h3">Current Zone: A3 - C5</Text>
        <Text preset="muted">Signal quality: Good</Text>
      </Card>
      <Button text="Start Range Test" />
    </Screen>
  )
}
