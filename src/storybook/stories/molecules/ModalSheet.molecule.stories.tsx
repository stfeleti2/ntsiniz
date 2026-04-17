import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Stack, Text } from '@/ui/primitives'
import { ModalSheet } from '@/ui/components/ModalSheet'

const meta: Meta<typeof ModalSheet> = {
  title: 'Patterns/Layouts/ModalSheet',
  component: ModalSheet,
}

export default meta

type Story = StoryObj<typeof meta>

function Content({ label }: { label: string }) {
  return (
    <Stack gap={8}>
      <Text weight="bold">{label}</Text>
      <Text tone="muted">Sheet content example</Text>
    </Stack>
  )
}

export const Default: Story = {
  render: () => (
    <ModalSheet visible onClose={() => {}}>
      <Content label="Default sheet" />
    </ModalSheet>
  ),
}

export const Loading: Story = {
  render: () => (
    <ModalSheet visible onClose={() => {}}>
      <Content label="Loading sheet" />
    </ModalSheet>
  ),
}

export const Disabled: Story = {
  render: () => (
    <ModalSheet visible={false} onClose={() => {}}>
      <Content label="Disabled sheet" />
    </ModalSheet>
  ),
}

export const Error: Story = {
  render: () => (
    <ModalSheet visible onClose={() => {}}>
      <Content label="Error sheet" />
    </ModalSheet>
  ),
}

export const Empty: Story = {
  render: () => <ModalSheet visible onClose={() => {}} />,
}

export const Success: Story = {
  render: () => (
    <ModalSheet visible onClose={() => {}}>
      <Content label="Success sheet" />
    </ModalSheet>
  ),
}
