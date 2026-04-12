import type { Meta, StoryObj } from '@storybook/react-native'
import { SessionSummaryPanel } from '@/ui/components/SessionSummaryPanel'

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

export const Default = Success
export const Loading = Default
export const Disabled = Default
export const Error = Default
export const Empty = Default
