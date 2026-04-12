import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { ProgressBar } from '@/ui/components/ProgressBar'

const meta: Meta<typeof ProgressBar> = {
  title: 'Molecules/ProgressBar',
  component: ProgressBar,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = { args: { pct: 50 } }
export const Loading: Story = { args: { pct: 25 } }
export const Disabled: Story = { args: { pct: 0 } }
export const Error: Story = { args: { pct: 5 } }
export const Empty: Story = { args: { pct: 0 } }
export const Success: Story = { args: { pct: 100 } }
