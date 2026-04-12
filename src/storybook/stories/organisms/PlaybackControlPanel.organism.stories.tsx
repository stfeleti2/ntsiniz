import type { Meta, StoryObj } from '@storybook/react-native'
import { PlaybackControlPanel } from '@/ui/components/PlaybackControlPanel'

const meta: Meta<typeof PlaybackControlPanel> = {
  title: 'Organisms/PlaybackControlPanel',
  component: PlaybackControlPanel,
  args: {
    elapsed: '00:14 / 00:56',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading = Default
export const Disabled = Default
export const Error = Default
export const Empty = Default
export const Success = Default
