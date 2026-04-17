import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { FieldGroup } from '@/ui/components/FieldGroup'
import { Input } from '@/ui/primitives'

const meta: Meta<typeof FieldGroup> = {
  title: 'Patterns/Layouts/FieldGroup',
  component: FieldGroup,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <FieldGroup title="Sign in" hint="Enter your email and 6-digit code.">
      <Input label="Email" value="singer@example.com" onChangeText={() => {}} editable={false} />
      <Input label="Code" value="123456" onChangeText={() => {}} editable={false} />
    </FieldGroup>
  ),
}

export const Loading = Default
export const Disabled = Default
export const Error = Default
export const Empty = Default
export const Success = Default
