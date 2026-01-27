import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

// Map input types to appropriate inputMode for mobile keyboards
const getInputMode = (type: string | undefined): React.HTMLAttributes<HTMLInputElement>['inputMode'] => {
  switch (type) {
    case 'email':
      return 'email'
    case 'tel':
      return 'tel'
    case 'url':
      return 'url'
    case 'number':
      return 'numeric'
    case 'search':
      return 'search'
    default:
      return undefined
  }
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputMode, ...props }, ref) => {
    // Use provided inputMode or derive from type
    const derivedInputMode = inputMode ?? getInputMode(type)

    return (
      <input
        type={type}
        inputMode={derivedInputMode}
        className={cn(
          // Base styles with mobile optimizations
          "flex w-full rounded-base border bg-background-elevated px-3 py-2 text-foreground-primary placeholder:text-foreground-muted",
          // Focus styles
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary",
          // Disabled styles
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Transition
          "transition-all duration-300",
          // Mobile optimizations: min-height for touch targets, text-[16px] prevents iOS auto-zoom
          "min-h-[44px] text-[16px] sm:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
