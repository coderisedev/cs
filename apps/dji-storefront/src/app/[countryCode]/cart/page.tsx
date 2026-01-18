import { retrieveCart } from "@/lib/data/cart"
import { CartClient } from "@/components/cart/cart-client"

export const metadata = {
  title: "Cart · Cockpit Simulator",
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const cart = await retrieveCart()

  return <CartClient cart={cart} countryCode={countryCode} />
}
