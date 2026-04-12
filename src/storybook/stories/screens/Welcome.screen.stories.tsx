import type { Meta, StoryObj } from '@storybook/react-native'
import { WelcomePreview } from '@/screens/previews'

const meta: Meta<typeof WelcomePreview> = {
  title: 'Screens/Welcome',
  component: WelcomePreview,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading = Default
export const Disabled = Default
export const Error = Default
export const Empty = Default
export const Success = Default
