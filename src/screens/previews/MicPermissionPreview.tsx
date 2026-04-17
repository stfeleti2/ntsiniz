import React from 'react'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'

export function MicPermissionPreview() {
  return (
    <Screen scroll>
      <Text preset="h2">Microphone Access</Text>
      <Text preset="muted">We only use the mic during active singing drills.</Text>
      <Card tone="warning">
        <Text preset="h3">Permission needed</Text>
        <Text preset="muted">Enable microphone to continue into calibration.</Text>
      </Card>
      <Button text="Allow Microphone" />
      <Button text="Not Now" variant="ghost" />
    </Screen>
  )
}
