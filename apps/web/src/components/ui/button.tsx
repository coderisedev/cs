import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Loader2 } from "lucide-react"

import { cn } from "./cn"

const baseStyles =
  "inline-flex min-w-[44px] items-center justify-center gap-2 rounded-pill text-sm font-semibold tracking-tight transition-[background-color,border-color,color,box-shadow] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--dji-color-focus-ring))] disabled:pointer-events-none disabled:opacity-50"

const variantStyles = {
  primary:
    "bg-[hsl(var(--dji-color-surface-interactive))] text-[hsl(var(--dji-color-foreground-on-color))] shadow-xs hover:bg-[hsl(var(--dji-color-surface-interactive-hover))]",
  secondary:
    "bg-surface-secondary text-foreground-base border border-border-base hover:bg-surface-neutral-hover",
  outline:
    "border border-border-base bg-transparent text-foreground-base hover:bg-surface-neutral-hover",
  ghost:
    "bg-transparent text-foreground-base hover:bg-surface-neutral-hover",
  subtle:
    "bg-surface-field text-foreground-base hover:bg-surface-field-hover",
  destructive:
    "bg-[hsl(var(--dji-color-status-error))] text-foreground-on hover:opacity-90",
  link:
    "bg-transparent text-foreground-interactive px-0 hover:underline underline-offset-4",
} as const

const sizeStyles = {
  xs: "h-8 px-3 text-xs",
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
} as const

export type ButtonVariant = keyof typeof variantStyles
export type ButtonSize = keyof typeof sizeStyles

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      loading,
      isLoading,
      disabled,
      children,
      type,
      ...props
    },
    ref
  ) => {
    const Component = asChild ? Slot : "button"
    const isBusy = loading ?? isLoading ?? false
    const computedDisabled = (disabled ?? false) || isBusy
    const buttonType = type ?? "button"

    const content = asChild ? (
      children
    ) : (
      <>
        {isBusy && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        )}
        {children}
      </>
    )

    return (
      <Component
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          computedDisabled 
            ? "pointer-events-none opacity-70"
            : undefined,
          className
        )}
        data-disabled={computedDisabled ? "" : undefined}
        {...props}
        {...(!asChild
          ? { disabled: computedDisabled, type: buttonType }
          : { "aria-disabled": computedDisabled ? true : undefined })}
      >
        {content}
      </Component>
    )
  }
)

Button.displayName = "Button"
