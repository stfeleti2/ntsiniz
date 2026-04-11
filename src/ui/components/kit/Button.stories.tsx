import type { Meta, StoryObj } from "@storybook/react-native"
import { Button } from "./Button"

const meta = {
  title: "Kit/Button",
  component: Button,
  args: {
    label: "Start Session",
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = {
  args: {
    variant: "secondary",
    label: "Open Preview",
  },
}

export const Ghost: Story = {
  args: {
    variant: "ghost",
    label: "Skip",
  },
}

export const Loading: Story = {
  args: {
    loading: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
