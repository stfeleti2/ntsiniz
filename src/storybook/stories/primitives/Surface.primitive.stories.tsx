import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Surface, Text } from '@/ui/primitives'

const meta: Meta<typeof Surface> = {
  title: 'Primitives/Surface',
  component: Surface,
}

export default meta

type Story = StoryObj<typeof meta>

function Demo({ label, accentRole }: { label: string; accentRole?: 'primary' | 'secondary' | 'success' | 'warning' }) {
  return (
    <Surface tone="raised" padding={16} accentRole={accentRole}>
      <Text>{label}</Text>
    </Surface>
  )
}

export const Playground: Story = { render: () => <Demo label="Raised surface" /> }

export const Variants: Story = {
  render: () => (
    <Surface tone="raised" neoVariant="layered" padding={16}>
      <Text>Layered surface variant</Text>
    </Surface>
  ),
}

export const States: Story = {
  render: () => (
    <Surface tone="glass" padding={16}>
      <Text tone="muted">Disabled surface</Text>
    </Surface>
  ),
}

export const Themes: Story = {
  render: () => <Demo label="Theme follows toolbar" accentRole="success" />,
}

export const Default: Story = Playground
export const Loading: Story = States
export const Disabled: Story = States
export const Error: Story = States
export const Empty: Story = States
export const Success: Story = Themes
