"use client"

import { HttpTypes } from "@medusajs/types"
import { ArrowLeft, Trash2 } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import DjiCartItem from "../components/dji-cart-item"
import DjiCartSummary from "../components/dji-cart-summary"
import DjiEmptyCart from "../components/dji-empty-cart"
import CartProgress from "../components/cart-progress"
import SignInPrompt from "../components/sign-in-prompt"

type DjiCartTemplateProps = {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}

export default function DjiCartTemplate({
  cart,
  customer,
}: DjiCartTemplateProps) {
  // If cart is null or empty, show empty cart
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="py-12">
        <div className="content-container">
          <DjiEmptyCart />
        </div>
      </div>
    )
  }

  const items = cart.items
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = cart.subtotal || 0
  const currencyCode = cart.currency_code || "usd"

  // Convert to number for calculation (Medusa returns in smallest unit)
  const subtotalAmount = subtotal / 100

  // Note: Clear cart functionality to be implemented
  const handleClearCart = async () => {
    if (confirm("Clear cart functionality will be implemented soon.")) {
      // TODO: Implement clear cart
      console.log("Clear cart action")
    }
  }

  return (
    <div className="py-8">
      <div className="content-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground-primary mb-2">
              Shopping Cart
            </h1>
            <p className="text-foreground-secondary">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <LocalizedClientLink href="/store">
            <button className="inline-flex items-center space-x-2 px-6 py-2.5 border border-border-primary rounded-md text-foreground-primary hover:bg-background-elevated transition-colors touch-target">
              <ArrowLeft className="h-4 w-4" />
              <span>Continue Shopping</span>
            </button>
          </LocalizedClientLink>
        </div>

        {/* Free Shipping Progress */}
        <CartProgress total={subtotalAmount} currency={currencyCode === "usd" ? "$" : ""} />

        {/* Sign In Prompt */}
        {!customer && (
          <div className="mb-6">
            <SignInPrompt />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <DjiCartItem
                key={item.id}
                item={item}
                currencyCode={currencyCode}
              />
            ))}

            {/* Clear Cart Button */}
            <div className="flex justify-end">
              <button
                onClick={handleClearCart}
                className="inline-flex items-center space-x-2 px-6 py-2.5 border border-error text-error rounded-md hover:bg-error hover:text-white transition-colors touch-target"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear Cart</span>
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <DjiCartSummary cart={cart} />
          </div>
        </div>
      </div>
    </div>
  )
}
