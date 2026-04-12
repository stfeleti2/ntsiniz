import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Input, Stack } from '@/ui/primitives'

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState('')
    return <Input label="Email" value={value} onChangeText={setValue} placeholder="singer@example.com" helperText="We only use this to sign you in." />
  },
}

export const Active: Story = {
  render: () => {
    const [value, setValue] = React.useState('active@example.com')
    return <Input label="Email" value={value} onChangeText={setValue} helperText="Focused or active state." />
  },
}

export const Disabled: Story = {
  render: () => <Input label="Email" value="disabled@example.com" onChangeText={() => {}} disabled helperText="Input disabled." />,
}

export const Error: Story = {
  render: () => {
    const [value, setValue] = React.useState('a')
    return <Input label="Username" value={value} onChangeText={setValue} errorText="Minimum 4 characters required." />
  },
}

export const Matrix: Story = {
  render: () => {
    const [name, setName] = React.useState('')
    return (
      <Stack gap={12}>
        <Input label="Name" value={name} onChangeText={setName} placeholder="Your name" />
        <Input label="Code" value="ABC" onChangeText={() => {}} disabled />
        <Input label="Email" value="wrong" onChangeText={() => {}} errorText="Invalid email format" />
      </Stack>
    )
  },
}

export const Loading = Default
export const Empty = Default
export const Success = Default
