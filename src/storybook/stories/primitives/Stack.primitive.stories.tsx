import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Box, Stack, Text } from '@/ui/primitives'

const meta: Meta<typeof Stack> = {
  title: 'Primitives/Stack',
  component: Stack,
}

export default meta

type Story = StoryObj<typeof meta>

function Node({ label, tone = '#2F3B59' }: { label: string; tone?: string }) {
  return (
    <Box style={{ backgroundColor: tone, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 }}>
      <Text size="sm">{label}</Text>
    </Box>
  )
}

export const Default: Story = {
  render: () => (
    <Stack gap={8}>
      <Node label="One" />
      <Node label="Two" />
      <Node label="Three" />
    </Stack>
  ),
}

export const Loading: Story = {
  render: () => (
    <Stack direction="horizontal" gap={8}>
      <Node label="Loading" tone="#434F6A" />
      <Node label="..." tone="#434F6A" />
    </Stack>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Stack gap={8}>
      <Box style={{ opacity: 0.45 }}>
        <Node label="Disabled layout" />
      </Box>
    </Stack>
  ),
}

export const Error: Story = {
  render: () => (
    <Stack gap={8}>
      <Node label="Validation failed" tone="#5A2630" />
    </Stack>
  ),
}

export const Empty: Story = {
  render: () => (
    <Stack gap={8}>
      <Text tone="muted">No stacked items</Text>
    </Stack>
  ),
}

export const Success: Story = {
  render: () => (
    <Stack direction="horizontal" gap={8}>
      <Node label="Done" tone="#1F5C45" />
      <Node label="Complete" tone="#1F5C45" />
    </Stack>
  ),
}
