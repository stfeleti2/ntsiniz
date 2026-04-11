import type { Meta, StoryObj } from '@storybook/react-native'
import { WelcomePreview } from '@/screens/previews'

const meta: Meta<typeof WelcomePreview> = {
  title: 'Screens/Welcome',
  component: WelcomePreview,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
