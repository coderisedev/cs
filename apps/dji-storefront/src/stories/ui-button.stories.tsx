/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from "@storybook/react"
import { Button, type ButtonProps } from "@/components/ui/button"

const meta: Meta<ButtonProps> = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Primary CTA",
  },
  parameters: {
    layout: "centered",
  },
}

export default meta

type Story = StoryObj<ButtonProps>

export const Primary: Story = {
  args: {
    variant: "default",
  },
}

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Action",
  },
}

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline Action",
  },
}

export const Icon: Story = {
  args: {
    size: "icon",
    children: "⚙️",
    className: "text-xl",
  },
}
