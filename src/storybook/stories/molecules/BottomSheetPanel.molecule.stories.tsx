import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Stack, Text } from '@/ui/primitives'
import { BottomSheetPanel } from '@/ui/components/BottomSheetPanel'

const meta: Meta<typeof BottomSheetPanel> = {
  title: 'Patterns/Layouts/BottomSheetPanel',
  component: BottomSheetPanel,
}

export default meta

type Story = StoryObj<typeof meta>

function Content({ label }: { label: string }) {
  return (
    <Stack gap={8}>
      <Text weight="bold">{label}</Text>
      <Text tone="muted">Bottom sheet content example</Text>
    </Stack>
  )
}

export const Default: Story = {
  render: () => (
    <BottomSheetPanel index={0}>
      <Content label="Default panel" />
    </BottomSheetPanel>
  ),
}

export const Loading: Story = {
  render: () => (
    <BottomSheetPanel index={0}>
      <Content label="Loading panel" />
    </BottomSheetPanel>
  ),
}

export const Disabled: Story = {
  render: () => (
    <BottomSheetPanel index={-1}>
      <Content label="Disabled panel" />
    </BottomSheetPanel>
  ),
}

export const Error: Story = {
  render: () => (
    <BottomSheetPanel index={0}>
      <Content label="Error panel" />
    </BottomSheetPanel>
  ),
}

export const Empty: Story = {
  render: () => <BottomSheetPanel index={0} />,
}

export const Success: Story = {
  render: () => (
    <BottomSheetPanel index={0}>
      <Content label="Success panel" />
    </BottomSheetPanel>
  ),
}
