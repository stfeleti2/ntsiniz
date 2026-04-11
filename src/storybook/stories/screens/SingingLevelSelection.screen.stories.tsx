import type { Meta, StoryObj } from '@storybook/react-native'
import { SingingLevelSelectionPreview } from '@/screens/previews'

const meta: Meta<typeof SingingLevelSelectionPreview> = {
  title: 'Screens/SingingLevelSelection',
  component: SingingLevelSelectionPreview,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
