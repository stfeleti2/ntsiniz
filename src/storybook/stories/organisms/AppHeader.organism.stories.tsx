import type { Meta, StoryObj } from '@storybook/react-native'
import { AppHeader } from '@/ui/components/AppHeader'

const meta: Meta<typeof AppHeader> = {
  title: 'Patterns/Layouts/AppHeader',
  component: AppHeader,
  args: {
    title: 'Ntsiniz',
    subtitle: 'A fair ear for your voice.',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading = Default
export const Disabled = Default
export const Error = Default
export const Empty = Default
export const Success = Default
