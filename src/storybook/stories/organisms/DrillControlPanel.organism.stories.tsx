import type { Meta, StoryObj } from '@storybook/react-native'
import { DrillControlPanel } from '@/ui/components/DrillControlPanel'

const meta: Meta<typeof DrillControlPanel> = {
  title: 'Organisms/DrillControlPanel',
  component: DrillControlPanel,
  args: {
    title: 'Pitch Match Drill',
    status: 'Ready to sing',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Ready: Story = {}

export const Loading: Story = {
  args: {
    status: 'Analyzing room noise...',
  },
}

export const Default = Ready
export const Disabled = Default
export const Error = Default
export const Empty = Default
export const Success = Default
