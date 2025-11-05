import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "./cn"

export const Accordion = AccordionPrimitive.Root

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b border-border-base", className)}
    {...props}
  />
))

AccordionItem.displayName = "AccordionItem"

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between py-4 text-left text-base font-medium text-foreground-base transition",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--dji-color-focus-ring))]",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className="h-4 w-4 text-foreground-muted transition-transform data-[state=open]:rotate-180"
        aria-hidden
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))

AccordionTrigger.displayName = "AccordionTrigger"

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm text-foreground-subtle data-[state=closed]:animate-accordion-close data-[state=open]:animate-accordion-open",
      className
    )}
    {...props}
  >
    <div className="pb-4 pt-0 text-sm leading-6">{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = "AccordionContent"
