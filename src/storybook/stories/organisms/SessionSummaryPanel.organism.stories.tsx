import type { Meta, StoryObj } from '@storybook/react-native'
import { SessionSummaryPanel } from '@/components/ui/organisms'

const meta: Meta<typeof SessionSummaryPanel> = {
  title: 'Organisms/SessionSummaryPanel',
  component: SessionSummaryPanel,
  args: {
    score: 86,
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Success: Story = {}

export const NeedsWork: Story = {
  args: {
    score: 62,
  },
}
