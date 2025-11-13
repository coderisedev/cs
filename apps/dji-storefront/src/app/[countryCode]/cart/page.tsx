import { retrieveCart } from "@/lib/data/cart"
import { CartClient } from "@/components/cart/cart-client"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"

export const metadata = {
  title: "Cart · Cockpit Simulator",
}

export default async function CartPage() {
  const cart = await retrieveCart()

  return <CartClient cart={cart} countryCode={DEFAULT_COUNTRY_CODE} />
}
