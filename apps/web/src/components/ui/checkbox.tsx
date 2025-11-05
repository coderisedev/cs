import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"

import { cn } from "./cn"

export type CheckboxProps = CheckboxPrimitive.CheckboxProps

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, ...props }, ref) => {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer inline-flex h-5 w-5 items-center justify-center rounded-sm border border-border-base bg-surface-field text-foreground-on shadow-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--dji-color-focus-ring))] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {props.checked === "indeterminate" ? (
          <Minus className="h-3 w-3" aria-hidden />
        ) : (
          <Check className="h-3 w-3" aria-hidden />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})

Checkbox.displayName = CheckboxPrimitive.Root.displayName
