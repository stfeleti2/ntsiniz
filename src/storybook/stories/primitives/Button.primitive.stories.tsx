import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Button, Stack } from '@/ui/primitives'

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  args: {
    label: 'Continue',
    variant: 'primary-light-rounded',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Pressed: Story = {
  args: {
    label: 'Pressed',
    variant: 'neo-depth-button',
    state: 'active',
  },
}

export const Active: Story = {
  args: {
    label: 'Active',
    variant: 'active-led-button',
    state: 'active',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    label: 'Loading',
    loading: true,
  },
}

export const Matrix: Story = {
  render: () => (
    <Stack gap={10}>
      <Button label="Primary Light Rounded" variant="primary-light-rounded" />
      <Button label="Icon Round Dark" variant="icon-round-dark" />
      <Button label="Neo Depth" variant="neo-depth-button" />
      <Button label="Active LED" variant="active-led-button" />
      <Button label="Primary" variant="primary" />
      <Button label="Secondary" variant="secondary" />
      <Button label="Ghost" variant="ghost" />
      <Button label="Danger" variant="danger" />
    </Stack>
  ),
}

export const Error = Default
export const Empty = Default
export const Success = Default
