import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Stack } from '@/ui/primitives'
import { Skeleton } from '@/ui/components/kit/Skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'Molecules/Skeleton',
  component: Skeleton,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = { render: () => <Skeleton height={14} /> }
export const Loading: Story = { render: () => <Skeleton height={16} width="75%" /> }
export const Disabled: Story = { render: () => <Skeleton height={14} style={{ opacity: 0.45 }} /> }
export const Error: Story = { render: () => <Skeleton height={14} style={{ borderColor: '#8F3C4A' }} /> }
export const Empty: Story = { render: () => <Skeleton height={10} width="30%" /> }
export const Success: Story = {
  render: () => (
    <Stack gap={8}>
      <Skeleton height={12} width="90%" />
      <Skeleton height={12} width="70%" />
      <Skeleton height={12} width="80%" />
    </Stack>
  ),
}
