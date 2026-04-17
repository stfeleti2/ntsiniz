import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Box, Stack, Text } from '@/ui/primitives'
import { useTheme } from '@/theme/provider'

const meta: Meta<typeof Box> = {
  title: 'Primitives/Box',
  component: Box,
}

export default meta

type Story = StoryObj<typeof meta>

function Swatch({ opacity = 1 }: { opacity?: number }) {
  const { colors } = useTheme()
  return (
    <Box
      style={{
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.surfaceRaised,
        borderWidth: 1,
        borderColor: colors.border,
        opacity,
      }}
    />
  )
}

export const Playground: Story = {
  render: () => <Swatch />,
}

export const Variants: Story = {
  render: () => {
    const { colors } = useTheme()
    return (
      <Stack gap={10}>
        <Box style={{ height: 48, borderRadius: 12, backgroundColor: colors.surfaceBase, borderWidth: 1, borderColor: colors.border }} />
        <Box style={{ height: 48, borderRadius: 12, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.borderStrong }} />
        <Box style={{ height: 48, borderRadius: 12, backgroundColor: colors.surfaceInset, borderWidth: 1, borderColor: colors.border }} />
      </Stack>
    )
  },
}

export const States: Story = {
  render: () => {
    const { colors } = useTheme()
    return (
      <Stack gap={10}>
        <Swatch />
        <Swatch opacity={0.78} />
        <Swatch opacity={0.5} />
        <Box style={{ borderRadius: 12, borderWidth: 1, borderColor: colors.danger, padding: 12 }}>
          <Text tone="danger">Error state container</Text>
        </Box>
      </Stack>
    )
  },
}

export const Themes: Story = {
  render: () => (
    <Stack gap={10}>
      <Text tone="muted">Use Storybook theme toggle for light and dark previews.</Text>
      <Swatch />
    </Stack>
  ),
}

export const Default: Story = Playground
export const Loading: Story = States
export const Disabled: Story = States
export const Error: Story = States
export const Empty: Story = States
export const Success: Story = Themes
