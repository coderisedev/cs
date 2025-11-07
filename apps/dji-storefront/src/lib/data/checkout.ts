"use server"

import { sdk } from "@/lib/medusa"
import { getAuthHeaders, getCartId, removeCartId, getCacheTag } from "@/lib/server/cookies"
import { revalidateTag } from "next/cache"
import medusaError from "@/lib/util/medusa-error"
import { redirect } from "next/navigation"

export async function placeOrder(countryCode: string = "us") {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No cart found")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const result = await sdk.store.cart.complete(cartId, {}, headers)

    if (result.type === "order") {
      // Clear the cart after successful order
      await removeCartId()
      
      // Revalidate caches
      const cartCacheTag = await getCacheTag("carts")
      if (cartCacheTag) {
        revalidateTag(cartCacheTag)
      }

      const orderCacheTag = await getCacheTag("orders")
      if (orderCacheTag) {
        revalidateTag(orderCacheTag)
      }

      // Redirect to order confirmation page
      redirect(`/${countryCode}/order/${result.order.id}/confirmed`)
    }

    return result
  } catch (error) {
    throw medusaError(error)
  }
}
