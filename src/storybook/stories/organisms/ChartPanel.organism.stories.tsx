import type { Meta, StoryObj } from '@storybook/react-native'
import { ChartPanel } from '@/ui/components/ChartPanel'

const meta: Meta<typeof ChartPanel> = {
  title: 'Patterns/Layouts/ChartPanel',
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

export const Loading = Default
export const Disabled = Default
export const Error = Default
export const Empty = Default
export const Success = Default
