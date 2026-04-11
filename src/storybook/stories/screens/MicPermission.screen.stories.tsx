import type { Meta, StoryObj } from '@storybook/react-native'
import { MicPermissionPreview } from '@/screens/previews'

const meta: Meta<typeof MicPermissionPreview> = {
  title: 'Screens/MicPermission',
  component: MicPermissionPreview,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
