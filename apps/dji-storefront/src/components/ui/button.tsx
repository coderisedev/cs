import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-300 ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:pointer-events-none disabled:opacity-45 touch-target touch-manipulation [-webkit-tap-highlight-color:transparent] active:scale-[0.98] min-h-[44px]",
  {
    variants: {
      variant: {
        // DJI Primary Button - Capsule Design
        default: "bg-primary-500 text-neutral-50 hover:bg-primary-600 shadow-sm hover:shadow-md active:bg-primary-700 rounded-pill-xxl px-4 py-2 text-sm hover:transform hover:-translate-y-0.5",
        // DJI Secondary Button - Dark Gray
        secondary: "bg-neutral-800 text-neutral-50 hover:bg-neutral-700 active:bg-neutral-900 rounded-sm px-8 py-3 text-base shadow-sm hover:shadow-md hover:transform hover:-translate-y-0.5",
        // DJI Outlined Button - Transparent with Border
        outline: "border border-neutral-500 bg-transparent text-foreground-primary hover:bg-background-elevated hover:border-primary-500 active:bg-background-elevated rounded-pill-md px-4 py-2 text-base hover:transform hover:-translate-y-0.5",
        // Destructive
        destructive: "bg-semantic-error text-neutral-50 hover:bg-semantic-error/90 active:bg-semantic-error/80 rounded-sm px-6 py-3 text-base shadow-sm hover:shadow-md hover:transform hover:-translate-y-0.5",
        // Ghost (adapts to theme foreground)
        ghost: "text-foreground-primary hover:bg-background-elevated active:bg-background-elevated rounded-base px-4 py-2 text-base hover:transform hover:-translate-y-0.5",
        // Link
        link: "text-primary-400 underline-offset-4 hover:underline p-0 h-auto hover:text-primary-300 text-sm",
      },
      size: {
        // DJI Button Sizes
        sm: "h-8 px-4 py-2 text-sm", // Small button
        default: "h-10 px-6 py-3 text-base", // Standard button
        lg: "h-12 px-8 py-4 text-lg", // Large button
        icon: "h-10 w-10", // Icon button
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
