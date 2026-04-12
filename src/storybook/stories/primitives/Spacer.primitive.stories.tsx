import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Box, Spacer, Stack, Text } from '@/ui/primitives'

const meta: Meta<typeof Spacer> = {
  title: 'Primitives/Spacer',
  component: Spacer,
}

export default meta

type Story = StoryObj<typeof meta>

function SpacerDemo({ size }: { size: number }) {
  return (
    <Stack>
      <Box style={{ height: 14, backgroundColor: '#344160', borderRadius: 8 }} />
      <Spacer size={size} />
      <Box style={{ height: 14, backgroundColor: '#344160', borderRadius: 8 }} />
      <Text size="xs" tone="muted">Spacer size: {size}</Text>
    </Stack>
  )
}

export const Default: Story = { render: () => <SpacerDemo size={8} /> }
export const Loading: Story = { render: () => <SpacerDemo size={12} /> }
export const Disabled: Story = { render: () => <SpacerDemo size={4} /> }
export const Error: Story = { render: () => <SpacerDemo size={16} /> }
export const Empty: Story = { render: () => <SpacerDemo size={0} /> }
export const Success: Story = { render: () => <SpacerDemo size={20} /> }
