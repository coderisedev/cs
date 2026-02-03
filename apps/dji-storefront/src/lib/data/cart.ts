"use server"

import { sdk } from "@/lib/medusa"
import medusaError from "@/lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions, getCartId, setCartId, removeCartId, getCacheTag } from "@/lib/server/cookies"
import { getRegionConfig } from "@/lib/config/regions"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"

/**
 * Get current country from cookie, defaults to 'us'
 */
async function getCurrentCountry(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.get('_medusa_country_code')?.value?.toLowerCase() || 'us'
}

export const retrieveCart = async (cartId?: string, fields?: string) => {
  const id = cartId || (await getCartId())
  if (!id) return null

  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("carts")),
  }

  try {
    const { cart } = await sdk.client.fetch<{ cart: HttpTypes.StoreCart }>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields: fields ?? "*items, *region, *items.product, *items.variant, *payment_collection, *payment_collection.payment_sessions, *shipping_methods, *shipping_address, *billing_address",
      },
      headers,
      next,
      cache: "no-store", // Don't cache to ensure we get fresh cart data during checkout
    })
    return cart
  } catch {
    return null
  }
}

/**
 * Get or create a cart with the correct region based on user's country
 * @param countryCode - Optional country code to use for region selection
 */
export const getOrSetCart = async (countryCode?: string) => {
  // Get country from parameter or cookie
  const country = countryCode || await getCurrentCountry()
  const regionConfig = getRegionConfig(country)

  const existingCart = await retrieveCart(undefined, "id,region_id,completed_at")
  const headers = {
    ...(await getAuthHeaders()),
  }

  // Check if cart is completed (completed_at may not be in type but exists in API response)
  const isCompleted = existingCart && (existingCart as { completed_at?: string | null }).completed_at

  // If cart doesn't exist or is already completed, create a new one
  let cart = existingCart
  if (!cart || isCompleted) {
    if (isCompleted) {
      // Clear the old completed cart cookie
      await removeCartId()
    }
    const { cart: newCart } = await sdk.store.cart.create({ region_id: regionConfig.id }, {}, headers)
    cart = newCart
    await setCartId(cart.id)
    await revalidateCart()
  }

  // Ensure cart is using the correct region for the current country
  if (cart.region_id !== regionConfig.id) {
    cart = (
      await sdk.store.cart.update(
        cart.id,
        { region_id: regionConfig.id },
        {},
        headers
      )
    ).cart
    await revalidateCart()
  }

  return cart
}

/**
 * Update cart region when user switches country
 * @param newCountryCode - New country code to switch to
 */
export const updateCartRegion = async (newCountryCode: string) => {
  const cartId = await getCartId()
  if (!cartId) return null

  const regionConfig = getRegionConfig(newCountryCode)
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const { cart } = await sdk.store.cart.update(
      cartId,
      { region_id: regionConfig.id },
      {},
      headers
    )
    await revalidateCart()
    return cart
  } catch (error) {
    console.error('Failed to update cart region:', error)
    return null
  }
}

export const addToCart = async ({ variantId, quantity, countryCode }: { variantId: string; quantity: number; countryCode: string }) => {
  const cart = await getOrSetCart(countryCode)
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    await sdk.store.cart.createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      undefined,
      headers
    )
    await revalidateCart()
  } catch (error) {
    throw medusaError(error)
  }
}

export const updateLineItem = async ({ lineId, quantity }: { lineId: string; quantity: number }) => {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No cart id")

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    await sdk.store.cart.updateLineItem(cartId, lineId, { quantity }, undefined, headers)
    await revalidateCart()
  } catch (error) {
    throw medusaError(error)
  }
}

export const deleteLineItem = async (lineId: string) => {
  const cartId = await getCartId()
  if (!cartId) return

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    await sdk.store.cart.deleteLineItem(cartId, lineId, headers)
    await revalidateCart()
  } catch (error) {
    throw medusaError(error)
  }
}

export const completeCart = async () => {
  const cartId = await getCartId()
  if (!cartId) throw new Error("Missing cart id")

  try {
    const result = await sdk.store.cart.complete(cartId)
    await removeCartId()
    await revalidateCart()
    return result
  } catch (error) {
    throw medusaError(error)
  }
}

const revalidateCart = async () => {
  const cartTag = await getCacheTag("carts")
  if (cartTag) {
    revalidateTag(cartTag)
  }
}

export const updateCart = async (data: HttpTypes.StoreUpdateCart) => {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("No cart found")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const { cart } = await sdk.store.cart.update(cartId, data, {}, headers)
    await revalidateCart()
    return cart
  } catch (error) {
    throw medusaError(error)
  }
}

export const setShippingMethod = async ({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    await sdk.store.cart.addShippingMethod(
      cartId,
      { option_id: shippingMethodId },
      {},
      headers
    )
    await revalidateCart()
  } catch (error) {
    throw medusaError(error)
  }
}

export const initiatePaymentSession = async (
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const resp = await sdk.store.payment.initiatePaymentSession(
      cart,
      data,
      {},
      headers
    )
    await revalidateCart()
    return resp
  } catch (error) {
    throw medusaError(error)
  }
}

export const listCartOptions = async () => {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    headers,
    cache: "no-store", // Don't cache shipping options as they depend on cart address
  })
}

/**
 * Apply a promo code to the cart
 * @param promoCode - The promotion code to apply
 */
export const applyPromoCode = async (promoCode: string) => {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No cart found")

  const headers = {
    ...(await getAuthHeaders()),
  }

  const { cart } = await sdk.client.fetch<{ cart: HttpTypes.StoreCart }>(
    `/store/carts/${cartId}/promotions`,
    {
      method: "POST",
      body: { promo_codes: [promoCode] },
      headers,
    }
  )
  await revalidateCart()
  return cart
}

/**
 * Remove a promo code from the cart
 * @param promoCode - The promotion code to remove
 */
export const removePromoCode = async (promoCode: string) => {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No cart found")

  const headers = {
    ...(await getAuthHeaders()),
  }

  const { cart } = await sdk.client.fetch<{ cart: HttpTypes.StoreCart }>(
    `/store/carts/${cartId}/promotions`,
    {
      method: "DELETE",
      body: { promo_codes: [promoCode] },
      headers,
    }
  )
  await revalidateCart()
  return cart
}
