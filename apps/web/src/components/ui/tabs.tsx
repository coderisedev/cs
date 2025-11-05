import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "./cn"

export const Tabs = TabsPrimitive.Root

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-12 items-center justify-start rounded-full border border-border-base bg-surface-secondary p-1 text-foreground-muted",
      className
    )}
    {...props}
  />
))

TabsList.displayName = TabsPrimitive.List.displayName

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-10 min-w-[96px] items-center justify-center rounded-full px-4 text-sm font-medium transition data-[state=active]:bg-surface-primary data-[state=active]:text-foreground-base data-[state=inactive]:text-foreground-muted",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--dji-color-focus-ring))]",
      className
    )}
    {...props}
  />
))

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-6 focus-visible:outline-none", className)}
    {...props}
  />
))

TabsContent.displayName = TabsPrimitive.Content.displayName
