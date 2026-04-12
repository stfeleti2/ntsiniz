import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { MicLevelMeter } from '@/ui/components/MicLevelMeter'

const meta: Meta<typeof MicLevelMeter> = {
  title: 'Molecules/MicLevelMeter',
  component: MicLevelMeter,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = { args: { peak: 0.42, clipped: false } }
export const Loading: Story = { args: { peak: 0.15, clipped: false } }
export const Disabled: Story = { args: { peak: 0, clipped: false } }
export const Error: Story = { args: { peak: 0.98, clipped: true } }
export const Empty: Story = { args: { peak: 0, clipped: false } }
export const Success: Story = { args: { peak: 0.65, clipped: false } }
