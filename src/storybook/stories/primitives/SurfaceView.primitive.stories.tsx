import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { SurfaceView, Text, Stack } from '@/ui/primitives'

const meta: Meta<typeof SurfaceView> = {
  title: 'Primitives/SurfaceView',
  component: SurfaceView,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <SurfaceView elevation="raised" padding={14}>
      <Text>Neumorphic layout view</Text>
    </SurfaceView>
  ),
}

export const States: Story = {
  render: () => (
    <Stack gap={10}>
      <SurfaceView elevation="flat" padding={12}><Text>Flat</Text></SurfaceView>
      <SurfaceView elevation="raised" padding={12}><Text>Raised</Text></SurfaceView>
      <SurfaceView elevation="inset" padding={12}><Text>Inset</Text></SurfaceView>
      <SurfaceView elevation="pressed" padding={12}><Text>Pressed</Text></SurfaceView>
      <SurfaceView elevation="glass" padding={12}><Text>Glass</Text></SurfaceView>
    </Stack>
  ),
}

export const Loading = Default
export const Disabled = Default
export const Error = Default
export const Empty = Default
export const Success = Default
