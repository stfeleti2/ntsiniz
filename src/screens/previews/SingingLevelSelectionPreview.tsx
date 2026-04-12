import React from 'react'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Stack } from '@/ui'
import { useTheme } from '@/theme/provider'

const levels = ['Just starting', 'Casual', 'Serious', 'Professional / Coach']

export function SingingLevelSelectionPreview() {
  const { spacing } = useTheme()

  return (
    <Screen scroll>
      <Text preset="h2">Select your singing level</Text>
      <Text preset="muted">This tunes helper density for your first drill.</Text>
      <Stack gap={spacing[2]}>
        {levels.map((level, idx) => (
          <Card key={level} tone={idx === 1 ? 'glow' : 'default'}>
            <Text preset="body">{level}</Text>
          </Card>
        ))}
      </Stack>
      <Stack direction="horizontal" gap={spacing[2]} style={{ flexWrap: 'wrap' }}>
        <Button text="Continue" />
        <Button text="Back" variant="secondary" />
      </Stack>
    </Screen>
  )
}
