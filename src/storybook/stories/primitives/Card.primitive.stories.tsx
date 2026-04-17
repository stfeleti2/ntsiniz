import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Card, Text, Stack } from '@/ui/primitives'

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card>
      <Text weight="semibold">Card Title</Text>
      <Text tone="muted">Default neumorphic card surface.</Text>
    </Card>
  ),
}

export const Elevated: Story = {
  render: () => (
    <Card elevation="raised">
      <Text weight="semibold">Elevated</Text>
      <Text tone="muted">Raised content card.</Text>
    </Card>
  ),
}

export const Inset: Story = {
  render: () => (
    <Card elevation="inset">
      <Text weight="semibold">Inset</Text>
      <Text tone="muted">Sunken informational card.</Text>
    </Card>
  ),
}

export const Mixed: Story = {
  render: () => (
    <Stack gap={12}>
      <Card elevation="flat"><Text>Flat</Text></Card>
      <Card elevation="glass"><Text>Glass</Text></Card>
      <Card elevation="pressed"><Text>Pressed</Text></Card>
    </Stack>
  ),
}

export const Loading = Default
export const Disabled = Default
export const Error = Default
export const Empty = Default
export const Success = Default
