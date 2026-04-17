import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Box, Text } from '@/ui/primitives'

const meta: Meta = {
  title: 'Patterns/Screens/CreatorProfile',
}

export default meta

type Story = StoryObj<typeof meta>

function State({ label }: { label: string }) {
  return (
    <Box style={{ gap: 10, padding: 16 }}>
      <Text weight="bold">CreatorProfile screen</Text>
      <Text tone="muted">{label}</Text>
    </Box>
  )
}

export const Default: Story = { render: () => <State label="Default" /> }
export const Loading: Story = { render: () => <State label="Loading" /> }
export const Disabled: Story = { render: () => <State label="Disabled" /> }
export const Error: Story = { render: () => <State label="Error" /> }
export const Empty: Story = { render: () => <State label="Empty" /> }
export const Success: Story = { render: () => <State label="Success" /> }
export const Themes: Story = {
  render: () => <State label="Switch toolbar Theme between dark and light." />,
}
export const BackgroundVariants: Story = {
  render: () => <State label="Switch toolbar Background between light, dark, neo-light, neo-dark, and texture." />,
}
