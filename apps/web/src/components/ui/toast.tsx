import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { X } from "lucide-react"

import { cn } from "./cn"

export const ToastProvider = ToastPrimitives.Provider

export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-6 right-6 z-[100] flex w-[360px] flex-col gap-3",
      className
    )}
    {...props}
  />
))

ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = {
  default: "bg-surface-elevated text-foreground-base",
  success: "bg-[hsl(var(--dji-color-status-success))] text-white",
  danger: "bg-[hsl(var(--dji-color-status-error))] text-white",
} as const

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> {
  variant?: keyof typeof toastVariants
}

export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(({ className, variant = "default", ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(
      "relative flex w-full items-start justify-between gap-4 rounded-2xl border border-border-base px-5 py-4 shadow-lg",
      "data-[state=open]:animate-enter data-[state=closed]:animate-leave",
      toastVariants[variant],
      className
    )}
    {...props}
  />
))

Toast.displayName = ToastPrimitives.Root.displayName

export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-base font-semibold", className)}
    {...props}
  />
))

ToastTitle.displayName = ToastPrimitives.Title.displayName

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-foreground-subtle", className)}
    {...props}
  />
))

ToastDescription.displayName = ToastPrimitives.Description.displayName

export const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-3 top-3 text-foreground-muted transition hover:text-foreground-base",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" aria-hidden />
  </ToastPrimitives.Close>
))

ToastClose.displayName = ToastPrimitives.Close.displayName

export const ToastAction = ToastPrimitives.Action
