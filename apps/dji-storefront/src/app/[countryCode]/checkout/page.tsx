import { retrieveCart } from "@/lib/data/cart"
import { getCustomer } from "@/lib/data/account"
import { CheckoutClient } from "@/components/checkout/checkout-client"
import { notFound, redirect } from "next/navigation"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"

export const metadata = {
  title: "Checkout · DJI Storefront",
}

export default async function CheckoutPage() {
  const cart = await retrieveCart()

  if (!cart || !cart.items || cart.items.length === 0) {
    redirect(`/${DEFAULT_COUNTRY_CODE}/cart`)
  }

  const customer = await getCustomer()

  return <CheckoutClient cart={cart} customer={customer} countryCode={DEFAULT_COUNTRY_CODE} />
}
