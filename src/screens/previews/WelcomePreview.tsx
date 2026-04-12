import React from 'react'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Stack } from '@/ui'
import { useTheme } from '@/theme/provider'

export function WelcomePreview() {
  const { spacing } = useTheme()

  return (
    <Screen scroll>
      <Stack gap={spacing[2]}>
        <Text preset="h1">Ntsiniz</Text>
        <Text preset="muted">A fair ear for your voice.</Text>
      </Stack>
      <Card tone="elevated">
        <Text preset="h3">Welcome back</Text>
        <Text preset="muted">Let us sharpen your voice in one focused session.</Text>
      </Card>
      <Stack direction="horizontal" gap={spacing[2]} style={{ flexWrap: 'wrap' }}>
        <Button text="Start" />
        <Button text="Skip" variant="ghost" />
      </Stack>
    </Screen>
  )
}
