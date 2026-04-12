import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'
import { Card } from '@/ui/components/kit'
import { Heading } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'

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
        <Text preset="muted">Standard surface for content grouping.</Text>
      </Card>
      <Card tone="elevated">
        <Heading level={3}>Elevated Card</Heading>
        <Text preset="muted">Raised surface for important content.</Text>
      </Card>
      <Card tone="glow">
        <Heading level={3}>Glow Card</Heading>
        <Text preset="muted">Accent emphasis for key CTAs.</Text>
      </Card>
      <Card tone="warning">
        <Heading level={3}>Warning Card</Heading>
        <Text preset="muted">Call out cautionary context.</Text>
      </Card>
    </View>
  ),
}

export const Default = Variants
export const Loading = Default
export const Disabled = Default
export const Error = Default
export const Empty = Default
export const Success = Default
