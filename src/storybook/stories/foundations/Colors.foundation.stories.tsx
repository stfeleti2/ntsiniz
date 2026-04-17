import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'
import { designSystemColors } from '@/design-system/tokens/colors'
import { Stack, Text } from '@/ui/primitives'

const meta: Meta = {
  title: 'Foundations/Colors',
}

export default meta

type Story = StoryObj<typeof meta>

function Swatch({ name, color }: { name: string; color: string }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ height: 48, borderRadius: 12, backgroundColor: color }} />
      <Text size="sm" weight="medium">{name}</Text>
      <Text size="xs" tone="muted">{color}</Text>
    </View>
  )
}

export const Dark: Story = {
  parameters: { themeMode: 'dark' },
  render: () => {
    const palette = designSystemColors.dark
    return (
      <Stack gap={12}>
        <Swatch name="Canvas" color={palette.canvas} />
        <Swatch name="Surface" color={palette.surface} />
        <Swatch name="Elevated" color={palette.elevated} />
        <Swatch name="Stage Soft" color={palette.stageSoft} />
        <Swatch name="Stage Strong" color={palette.stageStrong} />
      </Stack>
    )
  },
}

export const Light: Story = {
  parameters: { themeMode: 'light' },
  render: () => {
    const palette = designSystemColors.light
    return (
      <Stack gap={12}>
        <Swatch name="Canvas" color={palette.canvas} />
        <Swatch name="Surface" color={palette.surface} />
        <Swatch name="Elevated" color={palette.elevated} />
        <Swatch name="Stage Soft" color={palette.stageSoft} />
        <Swatch name="Stage Strong" color={palette.stageStrong} />
      </Stack>
    )
  },
}

export const Default: Story = Dark
export const Loading: Story = Dark
export const Disabled: Story = Light
export const Error: Story = Dark
export const Empty: Story = Light
export const Success: Story = Light
