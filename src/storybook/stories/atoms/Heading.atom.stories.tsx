import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'
import { Heading } from '@/ui/components/kit'

const meta: Meta<typeof Heading> = {
  title: 'Atoms/Heading',
  component: Heading,
  args: {
    children: 'Ntsiniz Heading',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Level1: Story = {
  args: {
    level: 1,
  },
}

export const Level2: Story = {
  args: {
    level: 2,
  },
}

export const StackPreview: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <Heading level={1}>Welcome</Heading>
      <Heading level={2}>Singing Session</Heading>
      <Heading level={3}>Drill Prompt</Heading>
    </View>
  ),
}

export const Default = Level1
export const Loading = Default
export const Disabled = Default
export const Error = Default
export const Empty = Default
export const Success = Default
