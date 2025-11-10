import { retrieveCart } from "@/lib/data/cart"
import { getCustomer, getAddresses } from "@/lib/data/account"
import { CheckoutClient } from "@/components/checkout/checkout-client"
import { redirect } from "next/navigation"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"

export const metadata = {
  title: "Checkout · DJI Storefront",
}

type CheckoutPageProps = {
  params: { countryCode: string }
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const countryCode = params?.countryCode ?? DEFAULT_COUNTRY_CODE
  const cart = await retrieveCart()

  if (!cart || !cart.items || cart.items.length === 0) {
    redirect(`/${countryCode}/cart`)
  }

  const [customer, addresses] = await Promise.all([getCustomer(), getAddresses()])

  if (!customer) {
    const target = encodeURIComponent(`/${countryCode}/checkout`)
    redirect(`/${countryCode}/login?returnTo=${target}`)
  }

  return (
    <CheckoutClient cart={cart} customer={customer} countryCode={countryCode} customerAddresses={addresses} />
  )
}
