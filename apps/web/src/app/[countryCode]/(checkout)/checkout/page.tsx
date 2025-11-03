import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import DjiCheckoutForm from "@modules/checkout/templates/dji-checkout-form"
import DjiCheckoutSummary from "@modules/checkout/components/dji-checkout-summary"
import { ArrowLeft } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()
  const itemCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  return (
    <div className="py-8">
      <div className="content-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground-primary mb-2">
              Checkout
            </h1>
            <p className="text-foreground-secondary">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your order
            </p>
          </div>
          <LocalizedClientLink href="/cart">
            <button className="inline-flex items-center space-x-2 px-6 py-2.5 border border-border-primary rounded-md text-foreground-primary hover:bg-background-elevated transition-colors touch-target">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Cart</span>
            </button>
          </LocalizedClientLink>
        </div>

        {/* Main Checkout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <PaymentWrapper cart={cart}>
            <DjiCheckoutForm cart={cart} customer={customer} />
          </PaymentWrapper>
          <DjiCheckoutSummary cart={cart} />
        </div>
      </div>
    </div>
  )
}
