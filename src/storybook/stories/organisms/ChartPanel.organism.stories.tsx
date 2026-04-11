import type { Meta, StoryObj } from '@storybook/react-native'
import { ChartPanel } from '@/components/ui/organisms'

const meta: Meta<typeof ChartPanel> = {
  title: 'Organisms/ChartPanel',
  component: ChartPanel,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ImprovingTrend: Story = {
  args: {
    points: [54, 59, 61, 64, 68, 72, 79],
  },
}
