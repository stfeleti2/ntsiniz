import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'
import { Card } from '@/components/ui/molecules'
import { Heading, BodyText } from '@/components/ui/atoms'

const meta: Meta<typeof Card> = {
  title: 'Molecules/Card',
  component: Card,
}

export default meta

type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <View style={{ gap: 10 }}>
      <Card tone="default">
        <Heading level={3}>Default Card</Heading>
        <BodyText tone="muted">Standard surface for content grouping.</BodyText>
      </Card>
      <Card tone="elevated">
        <Heading level={3}>Elevated Card</Heading>
        <BodyText tone="muted">Raised surface for important content.</BodyText>
      </Card>
      <Card tone="glow">
        <Heading level={3}>Glow Card</Heading>
        <BodyText tone="muted">Accent emphasis for key CTAs.</BodyText>
      </Card>
      <Card tone="warning">
        <Heading level={3}>Warning Card</Heading>
        <BodyText tone="muted">Call out cautionary context.</BodyText>
      </Card>
    </View>
  ),
}
