import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { NextActionBar } from '@/ui/components/NextActionBar'

const meta: Meta<typeof NextActionBar> = {
  title: 'Molecules/NextActionBar',
  component: NextActionBar,
}

export default meta

type Story = StoryObj<typeof meta>

const baseArgs = {
  title: 'Ready for your next drill?',
  subtitle: 'One focused set builds momentum.',
  primaryLabel: 'Start now',
  onPrimary: () => {},
}

export const Default: Story = { args: baseArgs }
export const Loading: Story = { args: { ...baseArgs, subtitle: 'Loading recommendation...' } }
export const Disabled: Story = { args: { ...baseArgs, primaryLabel: 'Unavailable' } }
export const Error: Story = { args: { ...baseArgs, title: 'Could not load next action' } }
export const Empty: Story = { args: { ...baseArgs, subtitle: undefined } }
export const Success: Story = {
  args: {
    ...baseArgs,
    secondaryLabel: 'Later',
    onSecondary: () => {},
  },
}
