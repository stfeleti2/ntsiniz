import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Pressable, Text } from '@/ui/primitives'

const meta: Meta<typeof Pressable> = {
  title: 'Primitives/Pressable',
  component: Pressable,
}

export default meta

type Story = StoryObj<typeof meta>

type ChipProps = {
  label: string
  disabled?: boolean
  backgroundColor?: string
}

function Chip({ label, disabled, backgroundColor = '#2B3552' }: ChipProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {}}
      style={{
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#5A6787',
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignSelf: 'flex-start',
        opacity: disabled ? 0.5 : 1,
        backgroundColor,
      }}
    >
      <Text>{label}</Text>
    </Pressable>
  )
}

export const Default: Story = { render: () => <Chip label="Pressable" /> }
export const Loading: Story = { render: () => <Chip label="Loading" backgroundColor="#3F4A67" /> }
export const Disabled: Story = { render: () => <Chip label="Disabled" disabled /> }
export const Error: Story = { render: () => <Chip label="Error" backgroundColor="#5A2630" /> }
export const Empty: Story = { render: () => <Chip label="No action" /> }
export const Success: Story = { render: () => <Chip label="Saved" backgroundColor="#205640" /> }
