import * as React from "react"

import { cn } from "./cn"

const variantClasses = {
  "body-sm": "text-xs leading-5",
  body: "text-sm leading-6",
  "body-lg": "text-base leading-7",
  caption: "text-[13px] leading-5",
  eyebrow: "text-xs uppercase tracking-[0.2em]",
  overline: "text-[11px] uppercase tracking-[0.24em]",
} as const

const weightClasses = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
} as const

const toneClasses = {
  default: "text-foreground-base",
  subtle: "text-foreground-subtle",
  muted: "text-foreground-muted",
  inverse: "text-foreground-inverse",
  interactive: "text-foreground-interactive",
  success: "text-[hsl(var(--dji-color-status-success))]",
  danger: "text-[hsl(var(--dji-color-status-error))]",
} as const

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements
  variant?: keyof typeof variantClasses
  weight?: keyof typeof weightClasses
  tone?: keyof typeof toneClasses
  uppercase?: boolean
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      as = "p",
      className,
      variant = "body",
      weight = "regular",
      tone = "default",
      uppercase = false,
      ...props
    },
    ref
  ) => {
    const Component = as

    return (
      <Component
        ref={ref as never}
        className={cn(
          "font-sans tracking-tight",
          variantClasses[variant],
          weightClasses[weight],
          toneClasses[tone],
          uppercase && "uppercase",
          className
        )}
        {...props}
      />
    )
  }
)

Text.displayName = "Text"
