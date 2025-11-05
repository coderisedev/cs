import * as React from "react"

import { cn } from "./cn"

const sizeClasses = {
  display: "text-5xl leading-[1.1]",
  xl: "text-4xl leading-tight",
  lg: "text-3xl leading-tight",
  md: "text-2xl leading-snug",
  sm: "text-xl leading-snug",
  xs: "text-lg leading-snug",
} as const

const toneClasses = {
  default: "text-foreground-base",
  subtle: "text-foreground-subtle",
  inverse: "text-foreground-inverse",
} as const

const weightClasses = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
} as const

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: keyof JSX.IntrinsicElements
  size?: keyof typeof sizeClasses
  tone?: keyof typeof toneClasses
  weight?: keyof typeof weightClasses
  align?: "left" | "center" | "right"
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      as = "h2",
      className,
      size = "lg",
      tone = "default",
      weight = "semibold",
      align = "left",
      ...props
    },
    ref
  ) => {
    const Component = as

    return (
      <Component
        ref={ref as never}
        className={cn(
          "font-sans tracking-tight",
          sizeClasses[size],
          toneClasses[tone],
          weightClasses[weight],
          align === "center" && "text-center",
          align === "right" && "text-right",
          className
        )}
        {...props}
      />
    )
  }
)

Heading.displayName = "Heading"
