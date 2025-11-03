"use client"

import { ShoppingBag, ArrowLeft } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function DjiEmptyCart() {
  return (
    <div className="text-center py-16">
      <ShoppingBag className="h-24 w-24 text-foreground-muted mx-auto mb-6 transition-colors duration-300" />
      <h1 className="text-3xl font-bold text-foreground-primary mb-4 transition-colors duration-300">
        Your Cart is Empty
      </h1>
      <p className="text-foreground-secondary mb-8 max-w-md mx-auto transition-colors duration-300">
        Add some products to get started with your shopping.
      </p>
      <LocalizedClientLink href="/store">
        <button className="inline-flex items-center space-x-2 h-12 px-8 bg-primary-500 text-white font-medium rounded-pill-xxl hover:bg-primary-600 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 touch-target">
          <ArrowLeft className="h-5 w-5" />
          <span>Continue Shopping</span>
        </button>
      </LocalizedClientLink>
    </div>
  )
}
