import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'
import { Button } from '@/ui/components/kit'
import { IconButton } from '@/ui/components/kit'

const meta: Meta<typeof Button> = {
  title: 'Primitives/Buttons',
  component: Button,
  args: {
    text: 'Primary',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <View style={{ gap: 10 }}>
      <Button text="Start Drill" />
      <Button text="View Tips" variant="secondary" />
      <Button text="Skip" variant="ghost" />
      <IconButton icon="mic" accessibilityLabel="Mic" />
    </View>
  ),
}

export const Disabled: Story = {
  render: () => (
    <View style={{ gap: 10 }}>
      <Button text="Disabled" disabled />
      <Button text="Disabled" variant="secondary" disabled />
      <Button text="Disabled" variant="ghost" disabled />
    </View>
  ),
}

export const Default = Variants
export const Loading = Default
export const Error = Default
export const Empty = Default
export const Success = Default
