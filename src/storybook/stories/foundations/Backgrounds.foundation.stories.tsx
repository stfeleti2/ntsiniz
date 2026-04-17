import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'
import { Background } from '@/design-system/primitives'
import type { BackgroundVariant } from '@/design-system/tokens/backgrounds'
import { Stack, Text } from '@/ui/primitives'

const meta: Meta = {
  title: 'Foundations/Backgrounds',
}

export default meta

type Story = StoryObj<typeof meta>

function Sample({ variant }: { variant: BackgroundVariant }) {
  return (
    <Background variant={variant} style={{ minHeight: 120 }} contentStyle={{ justifyContent: 'center', padding: 16 }}>
      <Text weight="semibold">{variant}</Text>
      <Text tone="muted">Token-driven background variant</Text>
    </Background>
  )
}

export const Variants: Story = {
  render: () => (
    <Stack gap={12}>
      <Sample variant="solid" />
      <Sample variant="texture" />
      <Sample variant="layered" />
    </Stack>
  ),
}

export const Themes: Story = {
  render: () => (
    <Stack gap={12}>
      <View style={{ gap: 8 }}>
        <Text weight="semibold">Dark</Text>
        <Sample variant="texture" />
      </View>
      <View style={{ gap: 8 }}>
        <Text weight="semibold">Light</Text>
        <Background variant="texture" theme="light" style={{ minHeight: 120 }} contentStyle={{ justifyContent: 'center', padding: 16 }}>
          <Text weight="semibold">texture</Text>
          <Text tone="muted">Explicit light override</Text>
        </Background>
      </View>
    </Stack>
  ),
}

export const Default: Story = Variants
export const Loading: Story = Variants
export const Disabled: Story = Themes
export const Error: Story = Variants
export const Empty: Story = Themes
export const Success: Story = Themes
