import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Stack, Text } from '@/ui/primitives'

const meta: Meta<typeof Text> = {
  title: 'Primitives/Text',
  component: Text,
  args: {
    children: 'Voice clarity starts with consistent reps.',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = {
  args: {
    children: 'Loading transcript...',
    tone: 'muted',
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled label',
    tone: 'muted',
  },
}

export const Error: Story = {
  args: {
    children: 'Pitch detection failed',
    tone: 'danger',
  },
}

export const Empty: Story = {
  args: {
    children: 'No notes available yet',
    tone: 'muted',
  },
}

export const Success: Story = {
  args: {
    children: 'Session saved successfully',
    tone: 'success',
  },
}

export const TypeScale: Story = {
  render: () => (
    <Stack gap={6}>
      <Text size="xs">XS</Text>
      <Text size="sm">SM</Text>
      <Text size="md">MD</Text>
      <Text size="lg">LG</Text>
      <Text size="xl">XL</Text>
      <Text size="2xl">2XL</Text>
      <Text size="3xl">3XL</Text>
    </Stack>
  ),
}
