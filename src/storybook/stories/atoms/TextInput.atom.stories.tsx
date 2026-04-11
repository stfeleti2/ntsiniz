import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { TextInput } from '@/components/ui/atoms'

const meta: Meta<typeof TextInput> = {
  title: 'Atoms/TextInput',
  component: TextInput,
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
      <TextInput
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
  },
}
