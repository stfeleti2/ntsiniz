import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { SurfacePressable, Text } from '@/ui/primitives'

const meta: Meta<typeof SurfacePressable> = {
  title: 'Primitives/SurfacePressable',
  component: SurfacePressable,
}

export default meta

type Story = StoryObj<typeof meta>

function Demo({ label, disabled = false }: { label: string; disabled?: boolean }) {
  return (
    <SurfacePressable onPress={() => {}} disabled={disabled} style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
      <Text>{label}</Text>
    </SurfacePressable>
  )
}

export const Default: Story = { render: () => <Demo label="Press me" /> }
export const Loading: Story = { render: () => <Demo label="Loading action" /> }
export const Disabled: Story = { render: () => <Demo label="Disabled" disabled /> }
export const Error: Story = { render: () => <Demo label="Retry" /> }
export const Empty: Story = { render: () => <Demo label="No selection" /> }
export const Success: Story = { render: () => <Demo label="Saved" /> }
