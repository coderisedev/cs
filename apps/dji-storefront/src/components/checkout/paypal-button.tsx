"use client"

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { useCallback, useState } from "react"

interface PayPalButtonProps {
  amount: number
  currency?: string
  onApprove: (orderId: string) => Promise<void>
  onError?: (error: unknown) => void
  disabled?: boolean
}

export function PayPalButton({
  amount,
  currency = "USD",
  onApprove,
  onError,
  disabled = false,
}: PayPalButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCreateOrder = useCallback(
    (_data: Record<string, unknown>, actions: { order: { create: (options: unknown) => Promise<string> } }) => {
      // Convert cents to dollars for PayPal
      const dollarAmount = (amount / 100).toFixed(2)

      return actions.order.create({
        purchase_units: [
          {
            amount: {
              value: dollarAmount,
              currency_code: currency,
            },
          },
        ],
        intent: "CAPTURE",
      })
    },
    [amount, currency]
  )

  const handleApprove = useCallback(
    async (data: { orderID: string }) => {
      setIsProcessing(true)
      try {
        await onApprove(data.orderID)
      } catch (error) {
        onError?.(error)
      } finally {
        setIsProcessing(false)
      }
    },
    [onApprove, onError]
  )

  const handleError = useCallback(
    (error: Record<string, unknown>) => {
      console.error("PayPal error:", error)
      onError?.(error)
    },
    [onError]
  )

  if (!clientId) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-base text-sm text-yellow-700">
        PayPal is not configured. Please set NEXT_PUBLIC_PAYPAL_CLIENT_ID environment variable.
      </div>
    )
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency,
        intent: "capture",
      }}
    >
      <div className="paypal-button-container">
        <PayPalButtons
          disabled={disabled || isProcessing}
          style={{
            layout: "vertical",
            shape: "rect",
            label: "paypal",
            height: 48,
          }}
          createOrder={handleCreateOrder}
          onApprove={handleApprove}
          onError={handleError}
          onCancel={() => {
            console.log("PayPal payment cancelled")
          }}
        />
        {isProcessing && (
          <div className="mt-2 text-center text-sm text-foreground-secondary">
            Processing payment...
          </div>
        )}
      </div>
    </PayPalScriptProvider>
  )
}
