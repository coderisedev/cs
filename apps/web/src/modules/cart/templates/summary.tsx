"use client"

import { Button, Heading } from "@/components/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
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

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-y-4">
      <Heading as="h2" size="lg">
        Summary
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <Button asChild className="w-full" size="lg" data-testid="checkout-button">
        <LocalizedClientLink href={"/checkout?step=" + step}>
          Go to checkout
        </LocalizedClientLink>
      </Button>
    </div>
  )
}

export default Summary
