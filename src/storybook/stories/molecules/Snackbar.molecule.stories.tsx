import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Button, Stack } from '@/ui/primitives'
import { SnackbarProvider, useSnackbar } from '@/ui/components/kit/Snackbar'

const meta: Meta<typeof SnackbarProvider> = {
  title: 'Patterns/Layouts/Snackbar',
  component: SnackbarProvider,
}

export default meta

type Story = StoryObj<typeof meta>

function Demo({ message }: { message: string }) {
  const { show } = useSnackbar()
  return (
    <Stack>
      <Button label="Show snackbar" onPress={() => show(message)} />
    </Stack>
  )
}

function ProviderDemo({ message }: { message: string }) {
  return (
    <SnackbarProvider>
      <Demo message={message} />
    </SnackbarProvider>
  )
}

export const Default: Story = { render: () => <ProviderDemo message="Saved" /> }
export const Loading: Story = { render: () => <ProviderDemo message="Syncing changes..." /> }
export const Disabled: Story = { render: () => <ProviderDemo message="Action unavailable" /> }
export const Error: Story = { render: () => <ProviderDemo message="Sync failed" /> }
export const Empty: Story = { render: () => <ProviderDemo message="No notifications" /> }
export const Success: Story = { render: () => <ProviderDemo message="Session completed" /> }
