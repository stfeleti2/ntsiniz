import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { EmptyState } from '@/ui/components/kit/EmptyState'

const meta: Meta<typeof EmptyState> = {
  title: 'Patterns/Layouts/EmptyState',
  component: EmptyState,
  args: {
    title: 'No sessions yet',
    message: 'Run your first drill to start tracking progress.',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Loading: Story = { args: { title: 'Loading history' } }
export const Disabled: Story = { args: { title: 'Unavailable', message: 'Try again later.' } }
export const Error: Story = { args: { title: 'Failed to load', message: 'Please retry in a moment.' } }
export const Empty: Story = { args: { title: 'Nothing here', message: 'This area is currently empty.' } }
export const Success: Story = { args: { title: 'All set', message: 'Content is ready to explore.' } }
