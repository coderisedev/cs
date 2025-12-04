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

// Version that returns order ID instead of redirecting
// Used for client-side navigation after PayPal payment
export async function placeOrderAndGetId(countryCode: string = "us"): Promise<{ orderId: string; redirectUrl: string }> {
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

      // Return order info for client-side redirect
      const redirectUrl = `/${countryCode}/order/${result.order.id}/confirmed`
      return { orderId: result.order.id, redirectUrl }
    }

    throw new Error("Order completion did not return an order")
  } catch (error) {
    throw medusaError(error)
  }
}
