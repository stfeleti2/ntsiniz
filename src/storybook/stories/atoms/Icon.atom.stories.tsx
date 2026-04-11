import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'
import { Icon } from '@/components/ui/atoms'

const meta: Meta<typeof Icon> = {
  title: 'Atoms/Icon',
  component: Icon,
  args: {
    name: 'mic',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Gallery: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
      <Icon name="mic" />
      <Icon name="play" />
      <Icon name="pause" />
      <Icon name="check" />
      <Icon name="warning" />
      <Icon name="info" />
      <Icon name="star" />
      <Icon name="close" />
    </View>
  ),
}
