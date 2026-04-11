import type { Meta, StoryObj } from '@storybook/react-native'
import { SessionSummaryPreview } from '@/screens/previews'

const meta: Meta<typeof SessionSummaryPreview> = {
  title: 'Screens/SessionSummary',
  component: SessionSummaryPreview,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
