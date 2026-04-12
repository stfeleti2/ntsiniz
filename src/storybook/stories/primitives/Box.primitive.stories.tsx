import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Box, Stack, Text } from '@/ui/primitives'

const meta: Meta<typeof Box> = {
  title: 'Primitives/Box',
  component: Box,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Box style={{ height: 48, borderRadius: 12, backgroundColor: '#27304A' }} />,
}

export const Loading: Story = {
  render: () => <Box style={{ height: 48, borderRadius: 12, backgroundColor: '#3A445F', opacity: 0.7 }} />,
}

export const Disabled: Story = {
  render: () => <Box style={{ height: 48, borderRadius: 12, backgroundColor: '#27304A', opacity: 0.45 }} />,
}

export const Error: Story = {
  render: () => <Box style={{ height: 48, borderRadius: 12, backgroundColor: '#5A2630' }} />,
}

export const Empty: Story = {
  render: () => (
    <Box style={{ borderRadius: 12, borderWidth: 1, borderColor: '#44506B', padding: 12 }}>
      <Text tone="muted">No content in this container.</Text>
    </Box>
  ),
}

export const Success: Story = {
  render: () => (
    <Stack direction="horizontal" gap={8}>
      <Box style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#2E8C68' }} />
      <Text tone="success">Box ready</Text>
    </Stack>
  ),
}
