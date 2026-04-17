import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Stack } from '@/ui/primitives'
import { Radio } from '@/design-system/components/Radio'
import { variantRegistry } from '@/design-system/components/variantRegistry'

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
  args: {
    label: 'Warm-up mode',
    selected: false,
    state: 'default',
  },
  argTypes: {
    onPress: { action: 'pressed' },
    label: { control: { type: 'text' } },
    selected: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    variant: {
      control: { type: 'select' },
      options: variantRegistry.radio.variants,
    },
    state: {
      control: { type: 'select' },
      options: variantRegistry.radio.states,
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => {
    const [selected, setSelected] = React.useState(!!args.selected)
    const handlePress = () => {
      setSelected((prev) => !prev)
      args.onPress?.()
    }
    return <Radio {...args} selected={selected} onPress={handlePress} />
  },
}

export const Variants: Story = {
  render: () => (
    <Stack gap={10}>
      {variantRegistry.radio.variants.map((variant) => (
        <Stack key={variant} gap={8}>
          <Radio label={`${variant} selected`} variant={variant} selected state="default" />
          <Radio label={`${variant} unselected`} variant={variant} selected={false} state="default" />
        </Stack>
      ))}
    </Stack>
  ),
}

export const States: Story = {
  render: () => (
    <Stack gap={10}>
      <Radio label="Default" selected={false} state="default" />
      <Radio label="Hover" selected={false} state="hover" />
      <Radio label="Active" variant="neo-glow" selected state="active" />
      <Radio label="Disabled" selected={false} state="disabled" disabled />
    </Stack>
  ),
}

export const Themes: Story = {
  render: () => (
    <Stack gap={10}>
      <Radio label="Theme A" selected />
      <Radio label="Theme B" selected={false} />
    </Stack>
  ),
}

export const Default: Story = { args: { selected: false, state: 'default' } }
export const Hover: Story = { args: { selected: false, state: 'hover' } }
export const Active: Story = { args: { selected: true, state: 'active' } }
export const Disabled: Story = { args: { selected: false, state: 'disabled', disabled: true } }
export const Loading: Story = Default
export const Error: Story = Active
export const Empty: Story = Default
export const Success: Story = Hover
