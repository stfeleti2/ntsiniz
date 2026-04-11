import type { Meta, StoryObj } from '@storybook/react-native'
import { RangeFinderPreview } from '@/screens/previews'

const meta: Meta<typeof RangeFinderPreview> = {
  title: 'Screens/RangeFinder',
  component: RangeFinderPreview,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
