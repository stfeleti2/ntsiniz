import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Badge } from '@/ui/components/kit/Badge'

const meta: Meta<typeof Badge> = {
  title: 'Molecules/Badge',
  component: Badge,
  args: {
    label: 'In progress',
    tone: 'default',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Loading: Story = { args: { label: 'Loading' } }
export const Disabled: Story = { args: { label: 'Disabled' } }
export const Error: Story = { args: { label: 'Error', tone: 'danger' } }
export const Empty: Story = { args: { label: 'No data' } }
export const Success: Story = { args: { label: 'Complete', tone: 'success' } }
