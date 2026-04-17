import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'
import { Stack, Text } from '@/ui/primitives'
import { useTheme } from '@/theme/provider'

const meta: Meta = {
  title: 'Foundations/Shadows',
}

export default meta

type Story = StoryObj<typeof meta>

function ShadowCard({ label, style }: { label: string; style: Record<string, unknown> }) {
  const { colors } = useTheme()
  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          height: 72,
          borderRadius: 16,
          backgroundColor: colors.surfaceRaised,
          borderWidth: 1,
          borderColor: colors.border,
          ...(style as object),
        }}
      />
      <Text size="sm" weight="medium">{label}</Text>
    </View>
  )
}

export const Depths: Story = {
  render: () => {
    const theme = useTheme()

    return (
      <Stack gap={16}>
        <ShadowCard label="Flat" style={theme.elevation.neumorphic.flat as unknown as Record<string, unknown>} />
        <ShadowCard label="Raised" style={theme.elevation.neumorphic.raised as unknown as Record<string, unknown>} />
        <ShadowCard label="Inset" style={theme.elevation.neumorphic.inset as unknown as Record<string, unknown>} />
        <ShadowCard label="Pressed" style={theme.elevation.neumorphic.pressed as unknown as Record<string, unknown>} />
      </Stack>
    )
  },
}

export const Default: Story = Depths
export const Loading: Story = Depths
export const Disabled: Story = Depths
export const Error: Story = Depths
export const Empty: Story = Depths
export const Success: Story = Depths
