import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { AudioRoutePill } from '@/ui/components/AudioRoutePill'

const meta: Meta<typeof AudioRoutePill> = {
  title: 'Patterns/Layouts/AudioRoutePill',
  component: AudioRoutePill,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    route: { routeType: 'built_in_mic', isBluetoothInput: false, inputName: 'Built-in', inputUid: 'builtin' },
    onPress: () => {},
  },
}

export const Loading: Story = { args: { route: null } }
export const Disabled: Story = { args: { route: { routeType: 'wired_headset', isBluetoothInput: false } } }
export const Error: Story = { args: { route: { routeType: 'unknown', isBluetoothInput: true } } }
export const Empty: Story = { args: { route: { routeType: 'bluetooth_a2dp', isBluetoothInput: false } } }
export const Success: Story = { args: { route: { routeType: 'wired_headset', isBluetoothInput: false, inputName: 'USB Mic' } } }
