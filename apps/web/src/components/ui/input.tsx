import * as React from "react"

import { cn } from "./cn"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-md border border-border-base bg-surface-field px-4 text-sm text-foreground-base shadow-xs placeholder:text-foreground-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--dji-color-focus-ring))] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"
