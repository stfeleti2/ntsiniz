import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'
import { BodyText, HelperText } from '@/components/ui/atoms'

const meta: Meta<typeof BodyText> = {
  title: 'Atoms/BodyText',
  component: BodyText,
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
      <BodyText>Primary text tone</BodyText>
      <BodyText tone="muted">Muted helper tone</BodyText>
      <BodyText tone="success">Success tone</BodyText>
      <BodyText tone="warning">Warning tone</BodyText>
      <HelperText>Compact helper text</HelperText>
    </View>
  ),
}
