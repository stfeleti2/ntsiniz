import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'
import { SurfacePanel, Text, Stack } from '@/ui/primitives'

const meta: Meta<typeof SurfacePanel> = {
  title: 'Primitives/SurfacePanel',
  component: SurfacePanel,
}

export default meta

type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <Stack gap={12}>
      <SurfacePanel elevation="flat" padding={14}><Text>Flat</Text></SurfacePanel>
      <SurfacePanel elevation="raised" padding={14}><Text>Raised</Text></SurfacePanel>
      <SurfacePanel elevation="inset" padding={14}><Text>Inset</Text></SurfacePanel>
      <SurfacePanel elevation="pressed" padding={14}><Text>Pressed</Text></SurfacePanel>
      <SurfacePanel elevation="glass" padding={14}><Text>Glass</Text></SurfacePanel>
    </Stack>
  ),
}

export const PressedState: Story = {
  render: () => (
    <View style={{ transform: [{ scale: 0.98 }] }}>
      <SurfacePanel elevation="pressed" padding={14}>
        <Text>Pressed visual state</Text>
      </SurfacePanel>
    </View>
  ),
}

export const DisabledState: Story = {
  render: () => (
    <View style={{ opacity: 0.55 }}>
      <SurfacePanel elevation="raised" padding={14}>
        <Text tone="muted">Disabled visual state</Text>
      </SurfacePanel>
    </View>
  ),
}

export const Default = Variants
export const Loading = Default
export const Error = Default
export const Empty = Default
export const Success = Default
