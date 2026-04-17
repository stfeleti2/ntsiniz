import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { ListRow } from '@/ui/components/kit/ListRow'

const meta: Meta<typeof ListRow> = {
  title: 'Patterns/Layouts/ListRow',
  component: ListRow,
  args: {
    title: 'Audio input',
    subtitle: 'Built-in microphone',
    leftIcon: 'mic',
    onPress: () => {},
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Loading: Story = { args: { title: 'Loading devices...', subtitle: 'Please wait' } }
export const Disabled: Story = { args: { disabled: true } }
export const Error: Story = { args: { title: 'Device unavailable', subtitle: 'Reconnect and retry', leftIcon: '!' } }
export const Empty: Story = { args: { title: 'No devices found', subtitle: 'Connect a microphone', leftIcon: '-' } }
export const Success: Story = { args: { title: 'Device connected', subtitle: 'USB microphone ready', leftIcon: 'check' } }
