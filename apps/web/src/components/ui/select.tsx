import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "./cn"

export const Select = SelectPrimitive.Root

export const SelectValue = SelectPrimitive.Value

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-11 w-full items-center justify-between rounded-md border border-border-base bg-surface-field px-4 text-sm text-foreground-base shadow-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--dji-color-focus-ring))] disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon>
      <ChevronDown className="h-4 w-4 text-foreground-muted" aria-hidden />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))

SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-lg border border-border-base bg-surface-primary shadow-lg",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ScrollUpButton className="flex h-8 items-center justify-center text-foreground-muted">
        <ChevronUp className="h-4 w-4" aria-hidden />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" && "h-[var(--radix-select-trigger-height)] w-full"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="flex h-8 items-center justify-center text-foreground-muted">
        <ChevronDown className="h-4 w-4" aria-hidden />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))

SelectContent.displayName = SelectPrimitive.Content.displayName

export const SelectGroup = SelectPrimitive.Group
export const SelectLabel = SelectPrimitive.Label

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center gap-3 rounded-md py-2 pl-8 pr-3 text-sm text-foreground-base outline-none focus:bg-surface-neutral-hover data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemIndicator className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <Check className="h-3.5 w-3.5" aria-hidden />
    </SelectPrimitive.ItemIndicator>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))

SelectItem.displayName = SelectPrimitive.Item.displayName

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("my-1 h-px bg-border-base", className)}
    {...props}
  />
))

SelectSeparator.displayName = SelectPrimitive.Separator.displayName
