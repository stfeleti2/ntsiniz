import type { Meta, StoryObj } from "@storybook/react-native"
import { Input } from "./Input"

const meta = {
  title: "Kit/Input",
  component: Input,
  args: {
    value: "",
    onChangeText: () => {},
    label: "Email",
    placeholder: "you@ntsiniz.app",
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithHelper: Story = {
  args: {
    helperText: "We will send you a one-time sign-in code.",
  },
}

export const WithError: Story = {
  args: {
    value: "invalid",
    errorText: "Please enter a valid email address",
  },
}

export const Disabled: Story = {
  args: {
    value: "singer@ntsiniz.app",
    disabled: true,
  },
}
