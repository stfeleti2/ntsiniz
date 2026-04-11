import React from 'react'
import { View } from 'react-native'
import { Container, StatusBanner } from '@/components/ui/molecules'
import { AppHeader } from '@/components/ui/organisms'
import { PrimaryButton, GhostButton } from '@/components/ui/atoms'
import { useTheme } from '@/theme/provider'

export function WelcomePreview() {
  const { spacing } = useTheme()

  return (
    <Container>
      <AppHeader title="Ntsiniz" subtitle="A fair ear for your voice." />
      <StatusBanner title="Welcome back" body="Let us sharpen your voice in one focused session." tone="info" />
      <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
        <PrimaryButton label="Start" />
        <GhostButton label="Skip" />
      </View>
    </Container>
  )
}
