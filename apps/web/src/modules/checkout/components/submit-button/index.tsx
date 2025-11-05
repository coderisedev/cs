"use client"

import { Button, ButtonVariant } from "@/components/ui"
import React from "react"
import { useFormStatus } from "react-dom"

export function SubmitButton({
  children,
  variant = "primary",
  className,
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  variant?: ButtonVariant | null
  className?: string
  "data-testid"?: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      size="lg"
      className={className}
      type="submit"
      loading={pending}
      variant={variant || "primary"}
      data-testid={dataTestId}
    >
      {children}
    </Button>
  )
}
