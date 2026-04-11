import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'
import { StatusBanner } from '@/components/ui/molecules'

const meta: Meta<typeof StatusBanner> = {
  title: 'Molecules/StatusBanner',
  component: StatusBanner,
  args: {
    title: 'Microphone ready',
    body: 'Input levels are healthy for recording.',
    tone: 'success',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Success: Story = {}

export const Matrix: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <StatusBanner tone="info" title="Info" body="Helpful contextual status." />
      <StatusBanner tone="success" title="Success" body="The last drill improved by +4." />
      <StatusBanner tone="warning" title="Warning" body="Low room quality detected." />
      <StatusBanner tone="danger" title="Error" body="Microphone permission missing." />
    </View>
  ),
}
