import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Card } from '@/design-system/components/Card'
import { Stack, Text } from '@/ui/primitives'
import { variantRegistry } from '@/design-system/components/variantRegistry'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  args: {
    variant: 'flat-neo-card',
    state: 'default',
    padding: 16,
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: variantRegistry.card.variants,
    },
    state: {
      control: { type: 'select' },
      options: variantRegistry.card.states,
    },
    padding: { control: { type: 'number' } },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <Card {...args}>
      <Text weight="semibold">Progress Snapshot</Text>
      <Text tone="muted">You hit 84% pitch accuracy this week.</Text>
    </Card>
  ),
}

export const Variants: Story = {
  render: () => (
    <Stack gap={12}>
      {variantRegistry.card.variants.map((variant) => (
        <Card key={variant} variant={variant}>
          <Text weight="semibold">{variant}</Text>
          <Text tone="muted">Token-driven neo card variant</Text>
        </Card>
      ))}
    </Stack>
  ),
}

export const States: Story = {
  render: () => (
    <Stack gap={12}>
      {variantRegistry.card.states.map((state) => (
        <Card key={state} variant="animated-hover-card" state={state}>
          <Text weight="semibold">{state}</Text>
        </Card>
      ))}
    </Stack>
  ),
}

export const Themes: Story = {
  render: () => (
    <Card variant="layered-card">
      <Text weight="semibold">Theme responsive by toolbar</Text>
      <Text tone="muted">Switch light/dark to see token adaptation.</Text>
    </Card>
  ),
}

export const Default: Story = { args: { state: 'default' } }
export const Hover: Story = { args: { state: 'hover' } }
export const Active: Story = { args: { state: 'active', variant: 'glow-active-card' } }
export const Disabled: Story = { args: { state: 'disabled' } }
export const Loading: Story = Default
export const Error: Story = { args: { variant: 'glow-active-card', state: 'active' } }
export const Empty: Story = Default
export const Success: Story = { args: { variant: 'layered-card', state: 'default' } }
