"use client"

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { useCallback, useState } from "react"

interface PayPalButtonProps {
  // PayPal order ID created by Medusa backend (not created by frontend)
  paypalOrderId?: string
  currency?: string
  onApprove: () => Promise<void>
  onError?: (error: unknown) => void
  onCreateOrder: () => Promise<string | null>
  disabled?: boolean
}

export function PayPalButton({
  paypalOrderId,
  currency = "USD",
  onApprove,
  onError,
  onCreateOrder,
  disabled = false,
}: PayPalButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(paypalOrderId || null)

  // Create order: Call backend to prepare checkout and get PayPal order ID
  const handleCreateOrder = useCallback(async (): Promise<string> => {
    // If we already have an order ID from props, use it
    if (currentOrderId) {
      return currentOrderId
    }

    // Otherwise, call the parent's onCreateOrder to get one from the backend
    const orderId = await onCreateOrder()
    if (!orderId) {
      throw new Error("Failed to create PayPal order")
    }
    setCurrentOrderId(orderId)
    return orderId
  }, [currentOrderId, onCreateOrder])

  // Handle approval: User authorized the payment in PayPal
  const handleApprove = useCallback(
    async () => {
      setIsProcessing(true)
      try {
        await onApprove()
      } catch (error: unknown) {
        onError?.(error)
        setIsProcessing(false)
      }
    },
    [onApprove, onError]
  )

  const handleError = useCallback(
    (error: Record<string, unknown>) => {
      console.error("PayPal error:", error)
      setCurrentOrderId(null) // Reset order ID on error
      onError?.(error)
    },
    [onError]
  )

  const handleCancel = useCallback(() => {
    console.log("PayPal payment cancelled")
    setCurrentOrderId(null) // Reset order ID on cancel
  }, [])

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
          onCancel={handleCancel}
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
