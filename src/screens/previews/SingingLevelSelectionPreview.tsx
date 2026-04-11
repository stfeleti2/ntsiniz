import React from 'react'
import { View } from 'react-native'
import { Container, Card } from '@/components/ui/molecules'
import { Heading, BodyText, PrimaryButton, SecondaryButton } from '@/components/ui/atoms'
import { useTheme } from '@/theme/provider'

const levels = ['Just starting', 'Casual', 'Serious', 'Professional / Coach']

export function SingingLevelSelectionPreview() {
  const { spacing } = useTheme()

  return (
    <Container>
      <Heading level={2}>Select your singing level</Heading>
      <BodyText tone="muted">This tunes helper density for your first drill.</BodyText>
      <View style={{ gap: spacing[2] }}>
        {levels.map((level, idx) => (
          <Card key={level} tone={idx === 1 ? 'glow' : 'default'}>
            <BodyText>{level}</BodyText>
          </Card>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
        <PrimaryButton label="Continue" />
        <SecondaryButton label="Back" />
      </View>
    </Container>
  )
}
