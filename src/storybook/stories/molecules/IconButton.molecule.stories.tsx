import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { IconButton } from '@/ui/components/kit/IconButton'

const meta: Meta<typeof IconButton> = {
  title: 'Patterns/Layouts/IconButton',
  component: IconButton,
  args: {
    icon: 'mic',
    onPress: () => {},
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Loading: Story = { args: { icon: '...' } }
export const Disabled: Story = { args: { disabled: true } }
export const Error: Story = { args: { icon: '!' } }
export const Empty: Story = { args: { icon: '-' } }
export const Success: Story = { args: { icon: 'check' } }
