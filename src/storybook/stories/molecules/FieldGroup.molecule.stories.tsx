import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { FieldGroup } from '@/components/ui/molecules'
import { TextInput } from '@/components/ui/atoms'

const meta: Meta<typeof FieldGroup> = {
  title: 'Molecules/FieldGroup',
  component: FieldGroup,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <FieldGroup title="Sign in" hint="Enter your email and 6-digit code.">
      <TextInput label="Email" value="singer@example.com" editable={false} />
      <TextInput label="Code" value="123456" editable={false} />
    </FieldGroup>
  ),
}
