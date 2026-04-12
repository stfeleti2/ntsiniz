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

export const Default: Story = { render: () => <Demo label="Raised surface" /> }
export const Loading: Story = { render: () => <Demo label="Loading surface" accentRole="secondary" /> }
export const Disabled: Story = { render: () => <Surface tone="inset" padding={16}><Text tone="muted">Disabled surface</Text></Surface> }
export const Error: Story = { render: () => <Demo label="Error surface" accentRole="warning" /> }
export const Empty: Story = { render: () => <Surface tone="transparent" padding={16}><Text tone="muted">No content</Text></Surface> }
export const Success: Story = { render: () => <Demo label="Success surface" accentRole="success" /> }
