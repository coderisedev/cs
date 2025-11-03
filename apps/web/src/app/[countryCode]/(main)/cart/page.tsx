import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import DjiCartTemplate from "@modules/cart/templates/dji-cart-template"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
}

export default async function Cart() {
  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return null
  })

  const customer = await retrieveCustomer()

  return <DjiCartTemplate cart={cart} customer={customer} />
}
