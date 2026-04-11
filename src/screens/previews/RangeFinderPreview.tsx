import React from 'react'
import { Container, Card } from '@/components/ui/molecules'
import { Heading, BodyText, HelperText, PrimaryButton } from '@/components/ui/atoms'

export function RangeFinderPreview() {
  return (
    <Container>
      <Heading level={2}>Range Finder</Heading>
      <BodyText tone="muted">Find your stable singing range before harder drills.</BodyText>
      <Card tone="elevated">
        <Heading level={3}>Current Zone: A3 - C5</Heading>
        <HelperText>Signal quality: Good</HelperText>
      </Card>
      <PrimaryButton label="Start Range Test" />
    </Container>
  )
}
