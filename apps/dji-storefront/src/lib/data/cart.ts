"use server"

import { sdk } from "@/lib/medusa"
import medusaError from "@/lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions, getCartId, setCartId, removeCartId, getCacheTag } from "@/lib/server/cookies"
import { getRegion } from "@/lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"

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
        fields: fields ?? "*items, *region, *items.product, *items.variant",
      },
      headers,
      next,
      cache: "force-cache",
    })
    return cart
  } catch {
    return null
  }
}

export const getOrSetCart = async (countryCode: string) => {
  const region = await getRegion(countryCode)
  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart(undefined, "id,region_id")
  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!cart) {
    const { cart: newCart } = await sdk.store.cart.create({ region_id: region.id }, {}, headers)
    cart = newCart
    await setCartId(cart.id)
    await revalidateCart()
  }

  if (cart.region_id !== region.id) {
    cart = (
      await sdk.store.cart.update(
        cart.id,
        { region_id: region.id },
        {},
        headers
      )
    ).cart
    await revalidateCart()
  }

  return cart
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
      {},
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
    await sdk.store.cart.updateLineItem(cartId, lineId, { quantity }, {}, headers)
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
    await sdk.store.cart.deleteLineItem(cartId, lineId, {}, headers)
    await revalidateCart()
  } catch (error) {
    throw medusaError(error)
  }
}

export const completeCart = async () => {
  const cartId = await getCartId()
  if (!cartId) throw new Error("Missing cart id")

  try {
    const { cart } = await sdk.store.cart.complete(cartId)
    await removeCartId()
    await revalidateCart()
    return cart
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
