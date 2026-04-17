import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Stack } from '@/ui/primitives'
import { Switch } from '@/design-system/components/Switch'

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    checked: true,
    variant: 'neo-toggle',
    state: 'default',
  },
  argTypes: {
    onChange: { action: 'changed' },
    checked: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    variant: {
      control: { type: 'select' },
      options: ['neo-toggle', 'icon-round'],
    },
    state: {
      control: { type: 'select' },
      options: ['default', 'hover', 'active', 'disabled'],
    },
    checkedLabel: { control: { type: 'text' } },
    uncheckedLabel: { control: { type: 'text' } },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => {
    const [checked, setChecked] = React.useState(!!args.checked)
    const handleChange = (next: boolean) => {
      setChecked(next)
      args.onChange?.(next)
    }
    return <Switch {...args} checked={checked} onChange={handleChange} />
  },
}

export const Variants: Story = {
  render: () => (
    <Stack gap={12}>
      <Switch checked variant="neo-toggle" />
      <Switch checked={false} variant="icon-round" />
    </Stack>
  ),
}

export const States: Story = {
  render: () => (
    <Stack gap={12}>
      <Switch checked variant="neo-toggle" state="default" />
      <Switch checked variant="neo-toggle" state="hover" />
      <Switch checked variant="neo-toggle" state="active" />
      <Switch checked={false} variant="neo-toggle" state="disabled" disabled />
    </Stack>
  ),
}

export const Themes: Story = {
  render: () => (
    <Stack gap={12}>
      <Switch checked variant="icon-round" />
      <Switch checked={false} variant="icon-round" />
    </Stack>
  ),
}

export const Default: Story = { args: { checked: false, state: 'default' } }
export const Hover: Story = { args: { checked: true, state: 'hover' } }
export const Active: Story = { args: { checked: true, state: 'active' } }
export const Disabled: Story = { args: { checked: false, state: 'disabled', disabled: true } }
export const Loading: Story = Default
export const Error: Story = Active
export const Empty: Story = Default
export const Success: Story = Hover
