import type { Meta, StoryObj } from '@storybook/react-native'
import { PlaybackPreview } from '@/screens/previews'

const meta: Meta<typeof PlaybackPreview> = {
  title: 'Screens/Playback',
  component: PlaybackPreview,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
