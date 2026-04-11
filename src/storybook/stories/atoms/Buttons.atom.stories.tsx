import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'
import { PrimaryButton, SecondaryButton, GhostButton, IconButton } from '@/components/ui/atoms'

const meta: Meta<typeof PrimaryButton> = {
  title: 'Atoms/Buttons',
  component: PrimaryButton,
  args: {
    label: 'Primary',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <View style={{ gap: 10 }}>
      <PrimaryButton label="Start Drill" />
      <SecondaryButton label="View Tips" />
      <GhostButton label="Skip" />
      <IconButton icon="mic" />
    </View>
  ),
}

export const Disabled: Story = {
  render: () => (
    <View style={{ gap: 10 }}>
      <PrimaryButton label="Disabled" disabled />
      <SecondaryButton label="Disabled" disabled />
      <GhostButton label="Disabled" disabled />
    </View>
  ),
}
