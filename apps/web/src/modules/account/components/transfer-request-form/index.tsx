"use client"

import { Button, Heading, Input, Text } from "@/components/ui"
import { CheckCircleMiniSolid, XCircleSolid } from "@medusajs/icons"
import { useEffect, useState, useActionState } from "react"

import { createTransferRequest } from "@lib/data/orders"
import { SubmitButton } from "@modules/checkout/components/submit-button"

export default function TransferRequestForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
    }
  }, [state.success, state.order])

  return (
    <div className="flex w-full flex-col gap-y-4">
      <div className="grid w-full items-center gap-x-8 gap-y-4 small:grid-cols-2">
        <div className="flex flex-col gap-y-2">
          <Heading as="h3" size="sm">
            Order transfers
          </Heading>
          <Text tone="subtle">
            Can&apos;t find the order you are looking for?
            <br /> Connect an order to your account.
          </Text>
        </div>
        <form
          action={formAction}
          className="flex w-full flex-col gap-y-2 small:items-end"
        >
          <div className="flex w-full flex-col gap-y-2">
            <Input
              className="w-full"
              name="order_id"
              placeholder="Order ID"
              data-testid="transfer-order-input"
            />
            <SubmitButton
              variant="secondary"
              className="w-fit whitespace-nowrap self-end"
              data-testid="transfer-request-button"
            >
              Request transfer
            </SubmitButton>
          </div>
        </form>
      </div>
      {!state.success && state.error && (
        <Text tone="danger" className="text-right text-sm">
          {state.error}
        </Text>
      )}
      {showSuccess && (
        <div className="flex w-full items-center justify-between self-stretch rounded-2xl border border-border-base bg-surface-secondary p-4 shadow-xs">
          <div className="flex items-center gap-x-3">
            <CheckCircleMiniSolid className="h-5 w-5 text-[hsl(var(--dji-color-status-success))]" />
            <div className="flex flex-col gap-y-1">
              <Text className="font-semibold text-foreground-base">
                Transfer for order {state.order?.id} requested
              </Text>
              <Text tone="subtle">
                Transfer request email sent to {state.order?.email}
              </Text>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-foreground-subtle"
            onClick={() => setShowSuccess(false)}
            aria-label="Dismiss transfer success"
          >
            <XCircleSolid className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
