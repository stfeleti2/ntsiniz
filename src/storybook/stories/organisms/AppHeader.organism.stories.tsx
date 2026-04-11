import type { Meta, StoryObj } from '@storybook/react-native'
import { AppHeader } from '@/components/ui/organisms'

const meta: Meta<typeof AppHeader> = {
  title: 'Organisms/AppHeader',
  component: AppHeader,
  args: {
    title: 'Ntsiniz',
    subtitle: 'A fair ear for your voice.',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
