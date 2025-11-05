import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"

import { cn } from "./cn"

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn("grid gap-3", className)}
    {...props}
  />
))

RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label?: React.ReactNode
  labelClassName?: string
}

export const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, label, labelClassName, children, ...props }, ref) => {
  const content = label ?? children

  return (
    <label className="flex cursor-pointer items-center gap-3">
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border border-border-base text-foreground-base transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--dji-color-focus-ring))] data-[state=checked]:border-border-interactive",
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--dji-color-surface-interactive))]" />
      </RadioGroupPrimitive.Item>
      {content ? (
        <span className={cn("text-sm text-foreground-base", labelClassName)}>
          {content}
        </span>
      ) : null}
    </label>
  )
})

RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName
