import * as React from "react"

import { cn } from "./cn"

const widthMap = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
  full: "max-w-[1440px]",
} as const

const paddingMap = {
  none: "px-0",
  tight: "px-4",
  base: "px-6 sm:px-8",
  relaxed: "px-8 sm:px-10",
} as const

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: keyof typeof widthMap
  padding?: keyof typeof paddingMap
  bleed?: boolean
}

export function Container({
  className,
  width = "default",
  padding = "base",
  bleed = false,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        widthMap[width],
        !bleed && paddingMap[padding],
        className
      )}
      {...props}
    />
  )
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  background?: "primary" | "secondary" | "elevated"
  spacing?: "none" | "sm" | "md" | "lg"
}

const sectionBackgrounds = {
  primary: "bg-surface-primary",
  secondary: "bg-surface-secondary",
  elevated: "bg-surface-elevated",
}

const sectionSpacing = {
  none: "py-0",
  sm: "py-6",
  md: "py-10",
  lg: "py-16",
}

export function Section({
  className,
  background = "primary",
  spacing = "md",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "w-full",
        sectionBackgrounds[background],
        sectionSpacing[spacing],
        className
      )}
      {...props}
    />
  )
}
