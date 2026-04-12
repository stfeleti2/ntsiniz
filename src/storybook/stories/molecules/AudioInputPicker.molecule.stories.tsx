import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { AudioInputPicker } from '@/ui/components/AudioInputPicker'

const meta: Meta<typeof AudioInputPicker> = {
  title: 'Molecules/AudioInputPicker',
  component: AudioInputPicker,
}

export default meta

type Story = StoryObj<typeof meta>

const baseArgs = {
  visible: true,
  onClose: () => {},
  onSelected: () => {},
}

export const Default: Story = { args: baseArgs }
export const Loading: Story = { args: { ...baseArgs, currentUid: undefined } }
export const Disabled: Story = { args: { ...baseArgs, currentUid: null } }
export const Error: Story = { args: { ...baseArgs } }
export const Empty: Story = { args: { ...baseArgs, visible: false } }
export const Success: Story = { args: { ...baseArgs, currentUid: 'builtin' } }
