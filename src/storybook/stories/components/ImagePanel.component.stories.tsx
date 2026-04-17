import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Stack, Text } from '@/ui/primitives'
import { ImagePanel } from '@/design-system/components/ImagePanel'
import { variantRegistry } from '@/design-system/components/variantRegistry'

const source = require('../../../../assets/brand/splash.png')

const meta: Meta<typeof ImagePanel> = {
  title: 'Components/ImagePanel',
  component: ImagePanel,
  args: {
    source,
    variant: 'neo-image',
    state: 'default',
    height: 190,
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: variantRegistry.imagePanel.variants,
    },
    state: {
      control: { type: 'select' },
      options: variantRegistry.imagePanel.states,
    },
    height: { control: { type: 'number' } },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  render: () => (
    <Stack gap={12}>
      <ImagePanel source={source} variant="neo-image" />
      <ImagePanel source={source} variant="depth-inset" />
      <ImagePanel source={source} variant="overlay-glow" />
    </Stack>
  ),
}

export const States: Story = {
  render: () => (
    <Stack gap={12}>
      <ImagePanel source={source} variant="neo-image" state="default" />
      <ImagePanel source={source} variant="neo-image" state="hover" />
      <ImagePanel source={source} variant="overlay-glow" state="active" />
      <ImagePanel source={source} variant="depth-inset" state="disabled" />
    </Stack>
  ),
}

export const Themes: Story = {
  render: () => (
    <Stack gap={10}>
      <Text tone="muted">Global toolbar controls theme/background.</Text>
      <ImagePanel source={source} variant="overlay-glow" />
    </Stack>
  ),
}

export const Default: Story = { args: { state: 'default' } }
export const Hover: Story = { args: { state: 'hover' } }
export const Active: Story = { args: { state: 'active', variant: 'overlay-glow' } }
export const Disabled: Story = { args: { state: 'disabled' } }
export const Loading: Story = Default
export const Error: Story = { args: { variant: 'depth-inset', state: 'active' } }
export const Empty: Story = Default
export const Success: Story = { args: { variant: 'overlay-glow', state: 'default' } }
