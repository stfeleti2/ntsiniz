import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Background } from '@/design-system/primitives'
import type { BackgroundVariant } from '@/design-system/tokens/backgrounds'
import { Stack, Text } from '@/ui/primitives'

const meta: Meta<typeof Background> = {
  title: 'Primitives/Background',
  component: Background,
  args: {
    variant: 'solid',
    theme: 'light',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['solid', 'texture', 'layered'],
    },
    theme: {
      control: { type: 'select' },
      options: ['light', 'dark'],
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

function BackgroundSample({ variant }: { variant: BackgroundVariant }) {
  return (
    <Background variant={variant} style={{ minHeight: 120 }} contentStyle={{ justifyContent: 'center', padding: 16 }}>
      <Text weight="semibold">{variant}</Text>
      <Text tone="muted">Token-driven primitive</Text>
    </Background>
  )
}

export const Playground: Story = {
  render: (args) => <BackgroundSample variant={args.variant as BackgroundVariant} />,
}

export const Variants: Story = {
  render: () => (
    <Stack gap={12}>
      <BackgroundSample variant="solid" />
      <BackgroundSample variant="texture" />
      <BackgroundSample variant="layered" />
    </Stack>
  ),
}

export const States: Story = {
  render: () => (
    <Stack gap={12}>
      <Background variant="solid" style={{ minHeight: 96, opacity: 1 }} contentStyle={{ justifyContent: 'center', padding: 16 }}>
        <Text>Default</Text>
      </Background>
      <Background variant="texture" style={{ minHeight: 96, opacity: 0.86 }} contentStyle={{ justifyContent: 'center', padding: 16 }}>
        <Text>Hover</Text>
      </Background>
      <Background variant="layered" style={{ minHeight: 96, opacity: 0.7 }} contentStyle={{ justifyContent: 'center', padding: 16 }}>
        <Text tone="muted">Disabled</Text>
      </Background>
    </Stack>
  ),
}

export const Themes: Story = {
  render: () => (
    <Stack gap={12}>
      <Background variant="texture" theme="dark" style={{ minHeight: 110 }} contentStyle={{ justifyContent: 'center', padding: 16 }}>
        <Text>Dark texture</Text>
      </Background>
      <Background variant="texture" theme="light" style={{ minHeight: 110 }} contentStyle={{ justifyContent: 'center', padding: 16 }}>
        <Text>Light texture</Text>
      </Background>
    </Stack>
  ),
}

export const Default: Story = Playground
export const Loading: Story = States
export const Disabled: Story = States
export const Error: Story = States
export const Empty: Story = States
export const Success: Story = Themes
