"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartTotals from "@modules/common/components/cart-totals"
import DiscountCode from "@modules/checkout/components/discount-code"
import { ArrowRight, Shield } from "lucide-react"

type DjiCartSummaryProps = {
  cart: HttpTypes.StoreCart
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

export default function DjiCartSummary({ cart }: DjiCartSummaryProps) {
  const step = getCheckoutStep(cart)
  const itemCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  return (
    <div className="bg-background-secondary border-0 shadow-card rounded-md sticky top-24">
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground-primary mb-6">
          Order Summary
        </h2>

        {/* Discount Code */}
        <div className="mb-6">
          <DiscountCode cart={cart} />
        </div>

        {/* Totals */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-foreground-secondary">
              Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
            <CartTotals totals={cart} />
          </div>
        </div>

        {/* Checkout Button */}
        <LocalizedClientLink
          href={"/checkout?step=" + step}
          data-testid="checkout-button"
          className="block w-full"
        >
          <button className="w-full h-12 bg-primary-500 text-white font-medium rounded-pill-xxl hover:bg-primary-600 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 touch-target">
            <span>Proceed to Checkout</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </LocalizedClientLink>

        {/* Security Info */}
        <div className="mt-6 pt-6 border-t border-border-primary">
          <div className="flex items-center justify-center space-x-2 mb-2 text-sm text-foreground-muted">
            <Shield className="h-4 w-4" />
            <span>Secure Checkout</span>
          </div>
          <p className="text-xs text-foreground-muted text-center">
            Your payment information is protected with SSL encryption
          </p>
        </div>
      </div>
    </div>
  )
}
