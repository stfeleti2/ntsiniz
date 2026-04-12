import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { CelebrationOverlay } from '@/ui/components/CelebrationOverlay'

const meta: Meta<typeof CelebrationOverlay> = {
  title: 'Molecules/CelebrationOverlay',
  component: CelebrationOverlay,
}

export default meta

type Story = StoryObj<typeof meta>

const baseArgs = {
  visible: true,
  kind: 'win' as const,
  emoji: '🏁',
  title: 'Session complete',
  subtitle: 'You held pitch 12% longer today.',
  pills: [
    { emoji: '🔥', text: 'Streak +1' },
    { emoji: '🎯', text: 'Accuracy +3%' },
  ],
  onDone: () => {},
}

export const Default: Story = { args: baseArgs }
export const Loading: Story = { args: { ...baseArgs, title: 'Calculating results...' } }
export const Disabled: Story = { args: { ...baseArgs, visible: false } }
export const Error: Story = { args: { ...baseArgs, kind: 'pb', title: 'Try again', subtitle: 'Mic clipping detected' } }
export const Empty: Story = { args: { ...baseArgs, pills: [] } }
export const Success: Story = { args: { ...baseArgs, kind: 'streak', emoji: '✨', title: 'New streak' } }
