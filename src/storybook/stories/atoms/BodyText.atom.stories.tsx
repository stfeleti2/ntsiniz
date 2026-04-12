import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'
import { Text } from '@/ui/components/Typography'

const meta: Meta<typeof Text> = {
  title: 'Atoms/BodyText',
  component: Text,
  args: {
    children: 'Consistent body copy for onboarding and drill guidance.',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <Text preset="body">Primary text tone</Text>
      <Text preset="muted">Muted helper tone</Text>
      <Text preset="body" tone="success">Success tone</Text>
      <Text preset="body">Warning tone</Text>
      <Text preset="caption">Compact helper text</Text>
    </View>
  ),
}

export const Loading = Default
export const Disabled = Default
export const Error = Default
export const Empty = Default
export const Success = Default
