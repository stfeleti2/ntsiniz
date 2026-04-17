import type { Meta, StoryObj } from '@storybook/react-native'
import { DrillPreview } from '@/screens/previews'

const meta: Meta<typeof DrillPreview> = {
  title: 'Patterns/Screens/Drill',
  component: DrillPreview,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading = Default
export const Disabled = Default
export const Error = Default
export const Empty = Default
export const Success = Default
