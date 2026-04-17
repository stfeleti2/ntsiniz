import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Divider, Stack, Text } from '@/ui/primitives'

const meta: Meta<typeof Divider> = {
  title: 'Primitives/Divider',
  component: Divider,
}

export default meta

type Story = StoryObj<typeof meta>

function LabeledDivider({ label }: { label: string }) {
  return (
    <Stack gap={6}>
      <Text size="sm" tone="muted">{label}</Text>
      <Divider />
    </Stack>
  )
}

export const Default: Story = { render: () => <LabeledDivider label="Section" /> }
export const Loading: Story = { render: () => <LabeledDivider label="Loading section" /> }
export const Disabled: Story = { render: () => <LabeledDivider label="Disabled section" /> }
export const Error: Story = { render: () => <LabeledDivider label="Error section" /> }
export const Empty: Story = { render: () => <LabeledDivider label="Empty section" /> }
export const Success: Story = { render: () => <LabeledDivider label="Success section" /> }
