import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Button } from '@/design-system/components/Button'
import { variantRegistry } from '@/design-system/components/variantRegistry'
import { Stack, Text } from '@/ui/primitives'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: {
    label: 'Start Session',
    variant: 'primary-light-rounded',
    size: 'md',
    state: 'default',
  },
  argTypes: {
    onPress: { action: 'pressed' },
    onLongPress: { action: 'longPressed' },
    variant: {
      control: { type: 'select' },
      options: variantRegistry.button.variants,
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    state: {
      control: { type: 'select' },
      options: variantRegistry.button.states,
    },
    label: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    loading: { control: { type: 'boolean' } },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  render: () => (
    <Stack gap={12}>
      {variantRegistry.button.variants.map((variant) => (
        <Button key={variant} label={variant} variant={variant} />
      ))}
    </Stack>
  ),
}

export const States: Story = {
  render: () => (
    <Stack gap={10}>
      {variantRegistry.button.states.map((state) => (
        <Button key={state} label={`State: ${state}`} variant="neo-depth-button" state={state} disabled={state === 'disabled'} />
      ))}
    </Stack>
  ),
}

export const Themes: Story = {
  render: () => (
    <Stack gap={10}>
      <Text tone="muted">Use Storybook toolbar Theme + Background to switch globally.</Text>
      <Button label="Dark/Light Token Preview" variant="active-led-button" />
    </Stack>
  ),
}

export const Default: Story = { args: { state: 'default' } }
export const Hover: Story = { args: { state: 'hover' } }
export const Active: Story = { args: { state: 'active' } }
export const Disabled: Story = { args: { state: 'disabled', disabled: true } }
export const Loading: Story = { args: { loading: true, state: 'disabled' } }
export const Error: Story = { args: { variant: 'danger', label: 'Error State' } }
export const Empty: Story = { args: { label: 'Empty State' } }
export const Success: Story = { args: { variant: 'active-led-button', label: 'Success State' } }
