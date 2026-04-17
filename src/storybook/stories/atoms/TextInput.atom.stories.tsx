import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Input } from '@/ui/primitives'

const meta: Meta<typeof Input> = {
  title: 'Primitives/TextInput',
  component: Input,
  args: {
    label: 'Email',
    value: '',
    placeholder: 'singer@example.com',
    helperText: 'We only use this to sign you in.',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Editable: Story = {
  render: () => {
    const [value, setValue] = React.useState('')
    return (
      <Input
        label="Email"
        value={value}
        onChangeText={setValue}
        placeholder="singer@example.com"
        helperText="We only use this to sign you in."
      />
    )
  },
}

export const Error: Story = {
  args: {
    value: 'a',
    errorText: 'Minimum 4 characters required.',
    helperText: undefined,
    onChangeText: () => {},
  },
}

export const Default = Editable
export const Loading = Default
export const Disabled = Default
export const Empty = Default
export const Success = Default
