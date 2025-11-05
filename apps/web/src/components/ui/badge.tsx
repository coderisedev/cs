import * as React from "react"

import { cn } from "./cn"

const variantStyles = {
  primary:
    "bg-[hsl(var(--dji-color-surface-interactive))] text-[hsl(var(--dji-color-foreground-on-color))]",
  neutral: "bg-surface-secondary text-foreground-base",
  outline: "border border-border-base bg-transparent text-foreground-base",
  success: "bg-[hsl(var(--dji-color-status-success))] text-white",
  warning: "bg-[hsl(var(--dji-color-status-warning))] text-black",
} as const

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantStyles
  uppercase?: boolean
}

export function Badge({
  className,
  variant = "primary",
  uppercase = false,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-tight",
        uppercase && "uppercase tracking-[0.18em]",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
