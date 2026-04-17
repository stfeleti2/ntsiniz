import React from 'react'
import type { Meta, StoryFn } from '@storybook/react-native'
import { Stack, Text } from '@/ui/primitives'

const meta: Meta<typeof Text> = {
  title: 'Primitives/Text',
  component: Text,
  args: {
    children: 'Voice clarity starts with consistent reps.',
    variant: 'default',
    size: 'md',
    tone: 'default',
    depth: 'normal',
    weight: 'regular',
  },
  argTypes: {
    onPress: { action: 'pressed' },
    onLongPress: { action: 'longPressed' },
    variant: {
      control: { type: 'select' },
      options: ['default', 'carved', 'embossed', 'neo-soft'],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
    },
    depth: {
      control: { type: 'select' },
      options: ['soft', 'normal', 'strong'],
    },
    tone: {
      control: { type: 'select' },
      options: ['default', 'muted', 'danger', 'success'],
    },
    theme: {
      control: { type: 'select' },
      options: ['light', 'dark'],
    },
  },
}

export default meta

const PlaygroundTemplate: StoryFn<typeof Text> = (args) => <Text {...args} />
const VariantsTemplate: StoryFn<typeof Text> = () => (
  <Stack gap={8}>
    <Text variant="default" size="xl" weight="bold">DEFAULT</Text>
    <Text variant="carved" depth="soft" size="xl" weight="bold">CARVED SOFT</Text>
    <Text variant="carved" depth="strong" size="xl" weight="bold">CARVED STRONG</Text>
    <Text variant="embossed" depth="normal" size="xl" weight="bold">EMBOSSED</Text>
    <Text variant="neo-soft" depth="normal" size="xl" weight="bold">NEO SOFT</Text>
  </Stack>
)
const StatesTemplate: StoryFn<typeof Text> = () => (
  <Stack gap={8}>
    <Text>Default copy</Text>
    <Text tone="muted">Muted state</Text>
    <Text tone="danger">Error state</Text>
    <Text tone="success">Success state</Text>
  </Stack>
)
const ThemesTemplate: StoryFn<typeof Text> = () => (
  <Stack gap={8}>
    <Text tone="muted">Theme follows toolbar light/dark toggle.</Text>
    <Text variant="carved" theme="light" depth="normal">CARVED LIGHT PREVIEW</Text>
    <Text variant="carved" theme="dark" depth="normal">CARVED DARK PREVIEW</Text>
    <Text size="xs">XS</Text>
    <Text size="sm">SM</Text>
    <Text size="md">MD</Text>
    <Text size="lg">LG</Text>
    <Text size="xl">XL</Text>
    <Text size="2xl">2XL</Text>
    <Text size="3xl">3XL</Text>
    <Text tone="muted">TODO: Validate carved dark-mode contrast against final accessibility QA baseline.</Text>
  </Stack>
)

export const Playground = PlaygroundTemplate.bind({})
Playground.args = {
  children: 'Voice clarity starts with consistent reps.',
  variant: 'carved',
  depth: 'normal',
  size: 'md',
  tone: 'default',
}

export const Variants = VariantsTemplate.bind({})
Variants.args = {}

export const States = StatesTemplate.bind({})
States.args = {}

export const Themes = ThemesTemplate.bind({})
Themes.args = {}

export const Default = PlaygroundTemplate.bind({})
Default.args = { ...Playground.args, variant: 'default' }

export const Loading = PlaygroundTemplate.bind({})
Loading.args = { ...Playground.args, children: 'Loading text sample...', tone: 'muted' }

export const Disabled = PlaygroundTemplate.bind({})
Disabled.args = { ...Playground.args, tone: 'muted' }

export const Error = PlaygroundTemplate.bind({})
Error.args = { ...Playground.args, tone: 'danger', children: 'Error state copy' }

export const Empty = PlaygroundTemplate.bind({})
Empty.args = { ...Playground.args, children: '' }

export const Success = PlaygroundTemplate.bind({})
Success.args = { ...Playground.args, tone: 'success', children: 'Success state copy' }
