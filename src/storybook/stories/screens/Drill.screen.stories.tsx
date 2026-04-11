import type { Meta, StoryObj } from '@storybook/react-native'
import { DrillPreview } from '@/screens/previews'

const meta: Meta<typeof DrillPreview> = {
  title: 'Screens/Drill',
  component: DrillPreview,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
