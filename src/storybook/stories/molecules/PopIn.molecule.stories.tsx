import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Box, Text } from '@/ui/primitives'
import { PopIn } from '@/ui/components/PopIn'

const meta: Meta<typeof PopIn> = {
  title: 'Patterns/Layouts/PopIn',
  component: PopIn,
}

export default meta

type Story = StoryObj<typeof meta>

function Demo({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <PopIn enabled={enabled} delayMs={100}>
      <Box style={{ borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#2F3A58' }}>
        <Text>{label}</Text>
      </Box>
    </PopIn>
  )
}

export const Default: Story = { render: () => <Demo enabled label="Pop in" /> }
export const Loading: Story = { render: () => <Demo enabled label="Loading" /> }
export const Disabled: Story = { render: () => <Demo enabled={false} label="Disabled" /> }
export const Error: Story = { render: () => <Demo enabled label="Error" /> }
export const Empty: Story = { render: () => <Demo enabled={false} label="Empty" /> }
export const Success: Story = { render: () => <Demo enabled label="Success" /> }
