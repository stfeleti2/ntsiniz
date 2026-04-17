import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Stack, Text } from '@/ui/primitives'

const meta: Meta = {
  title: 'Foundations/Typography',
}

export default meta

type Story = StoryObj<typeof meta>

export const Scale: Story = {
  render: () => (
    <Stack gap={6}>
      <Text size="xs">XS</Text>
      <Text size="sm">SM</Text>
      <Text size="md">MD</Text>
      <Text size="lg">LG</Text>
      <Text size="xl">XL</Text>
      <Text size="2xl">2XL</Text>
      <Text size="3xl">3XL</Text>
    </Stack>
  ),
}

export const Variants: Story = {
  render: () => (
    <Stack gap={8}>
      <Text variant="default" size="xl" weight="bold">DEFAULT</Text>
      <Text variant="carved" depth="soft" size="xl" weight="bold">CARVED SOFT</Text>
      <Text variant="embossed" depth="normal" size="xl" weight="bold">EMBOSSED</Text>
      <Text variant="neo-soft" depth="strong" size="xl" weight="bold">NEO SOFT</Text>
    </Stack>
  ),
}

export const Default: Story = Scale
export const Loading: Story = Scale
export const Disabled: Story = Variants
export const Error: Story = Variants
export const Empty: Story = Scale
export const Success: Story = Variants
