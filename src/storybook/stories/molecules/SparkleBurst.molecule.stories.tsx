import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Box, Text } from '@/ui/primitives'
import { SparkleBurst } from '@/ui/components/SparkleBurst'

const meta: Meta<typeof SparkleBurst> = {
  title: 'Patterns/Layouts/SparkleBurst',
  component: SparkleBurst,
}

export default meta

type Story = StoryObj<typeof meta>

function Demo({ enabled, triggerKey, label }: { enabled: boolean; triggerKey: string | number; label: string }) {
  return (
    <Box style={{ height: 80, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{label}</Text>
      <SparkleBurst enabled={enabled} triggerKey={triggerKey} />
    </Box>
  )
}

export const Default: Story = { render: () => <Demo enabled triggerKey={1} label="Default burst" /> }
export const Loading: Story = { render: () => <Demo enabled triggerKey={2} label="Loading burst" /> }
export const Disabled: Story = { render: () => <Demo enabled={false} triggerKey={3} label="Disabled" /> }
export const Error: Story = { render: () => <Demo enabled triggerKey={4} label="Error burst" /> }
export const Empty: Story = { render: () => <Demo enabled={false} triggerKey={5} label="Empty" /> }
export const Success: Story = { render: () => <Demo enabled triggerKey={6} label="Success burst" /> }
