import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Box, Text } from '@/ui/primitives'
import { Screen } from '@/ui/components/Screen'

const meta: Meta<typeof Screen> = {
  title: 'Patterns/Layouts/Screen',
  component: Screen,
}

export default meta

type Story = StoryObj<typeof meta>

function Demo({ label }: { label: string }) {
  return (
    <Box style={{ gap: 10 }}>
      <Text>{label}</Text>
      <Box style={{ height: 100, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)' }} />
    </Box>
  )
}

export const Default: Story = {
  render: () => (
    <Screen title="Practice" subtitle="Stay on pitch" background="plain">
      <Demo label="Default content" />
    </Screen>
  ),
}

export const Loading: Story = {
  render: () => (
    <Screen title="Loading" subtitle="Preparing your session" background="gradient">
      <Demo label="Loading content" />
    </Screen>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Screen title="Unavailable" subtitle="Try later" background="plain">
      <Demo label="Disabled content" />
    </Screen>
  ),
}

export const Error: Story = {
  render: () => (
    <Screen title="Error" subtitle="Could not load recommendations" background="hero">
      <Demo label="Error content" />
    </Screen>
  ),
}

export const Empty: Story = {
  render: () => (
    <Screen title="Empty" subtitle="No items yet" background="plain">
      <Demo label="No content" />
    </Screen>
  ),
}

export const Success: Story = {
  render: () => (
    <Screen title="Completed" subtitle="Great progress" background="hero">
      <Demo label="Success content" />
    </Screen>
  ),
}
