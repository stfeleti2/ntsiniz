import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Stack } from '@/ui/primitives'
import { Text } from '@/ui/components/Typography'

const meta: Meta<typeof Text> = {
  title: 'Molecules/Typography',
  component: Text,
  args: {
    children: 'Consistent voice practice compounds quickly.',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Loading: Story = { args: { children: 'Loading copy…', preset: 'muted' } }
export const Disabled: Story = { args: { children: 'Disabled copy', muted: true } }
export const Error: Story = { args: { children: 'Error copy', tone: 'danger' } }
export const Empty: Story = { args: { children: 'No copy available', preset: 'caption' } }
export const Success: Story = { args: { children: 'Success copy', tone: 'success' } }

export const Presets: Story = {
  render: () => (
    <Stack gap={8}>
      <Text preset="h1">H1 Headline</Text>
      <Text preset="h2">H2 Headline</Text>
      <Text preset="h3">H3 Headline</Text>
      <Text preset="body">Body</Text>
      <Text preset="muted">Muted</Text>
      <Text preset="mono">Mono</Text>
      <Text preset="caption">Caption</Text>
    </Stack>
  ),
}
