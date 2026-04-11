import React from 'react'
import { Container, StatusBanner } from '@/components/ui/molecules'
import { Heading, BodyText, PrimaryButton, GhostButton } from '@/components/ui/atoms'

export function MicPermissionPreview() {
  return (
    <Container>
      <Heading level={2}>Microphone Access</Heading>
      <BodyText tone="muted">We only use the mic during active singing drills.</BodyText>
      <StatusBanner title="Permission needed" body="Enable microphone to continue into calibration." tone="warning" />
      <PrimaryButton label="Allow Microphone" />
      <GhostButton label="Not Now" />
    </Container>
  )
}
