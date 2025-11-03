"use client"

import { HttpTypes } from "@medusajs/types"
import { Shield, Truck, CreditCard } from "lucide-react"
import CartTotals from "@modules/common/components/cart-totals"
import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"

type DjiCheckoutSummaryProps = {
  cart: HttpTypes.StoreCart
}

export default function DjiCheckoutSummary({ cart }: DjiCheckoutSummaryProps) {
  const itemCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  return (
    <div className="bg-background-secondary border-0 shadow-card rounded-md sticky top-24">
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground-primary mb-6">
          Order Summary
        </h2>

        {/* Items Preview */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-foreground-secondary mb-3">
            Items ({itemCount})
          </h3>
          <ItemsPreviewTemplate cart={cart} />
        </div>

        {/* Discount Code */}
        <div className="mb-6">
          <DiscountCode cart={cart} />
        </div>

        {/* Totals */}
        <div className="border-t border-border-primary pt-4 mb-6">
          <CartTotals totals={cart} />
        </div>

        {/* Security Features */}
        <div className="space-y-3 pt-4 border-t border-border-primary">
          <div className="flex items-center space-x-2 text-sm text-foreground-muted">
            <Shield className="h-4 w-4" />
            <span>SSL Encrypted Checkout</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-foreground-muted">
            <Truck className="h-4 w-4" />
            <span>Free shipping on orders over $299</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-foreground-muted">
            <CreditCard className="h-4 w-4" />
            <span>Secure payment processing</span>
          </div>
        </div>
      </div>
    </div>
  )
}
