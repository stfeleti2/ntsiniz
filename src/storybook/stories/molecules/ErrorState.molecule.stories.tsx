import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { ErrorState } from '@/ui/components/kit/ErrorState'

const meta: Meta<typeof ErrorState> = {
  title: 'Molecules/ErrorState',
  component: ErrorState,
  args: {
    title: 'Connection lost',
    message: 'Check your internet and try again.',
    onRetry: () => {},
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Loading: Story = { args: { title: 'Loading failed', message: 'Waiting for retry window...' } }
export const Disabled: Story = { args: { title: 'Retry disabled', onRetry: undefined } }
export const Error: Story = { args: { title: 'Critical error', message: 'Audio route initialization failed.' } }
export const Empty: Story = { args: { title: 'No error details', message: undefined } }
export const Success: Story = { args: { title: 'Recovered', message: 'Connection has been restored.' } }
