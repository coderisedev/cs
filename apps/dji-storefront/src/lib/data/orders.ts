"use server"

import { sdk } from "@/lib/medusa"
import medusaError from "@/lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions } from "@/lib/server/cookies"
import { HttpTypes } from "@medusajs/types"

export const retrieveOrder = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
      method: "GET",
      query: {
        fields:
          "*payment_collections.payments,*items,*items.metadata,*items.variant,*items.product,*shipping_address,*billing_address,*shipping_methods",
      },
      headers,
      next,
      cache: "no-store", // Don't cache to ensure we get fresh order data
    })
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
}

export const listOrders = async (
  limit: number = 10,
  offset: number = 0
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<{ orders: HttpTypes.StoreOrder[] }>(`/store/orders`, {
      method: "GET",
      query: {
        limit,
        offset,
        fields: "*payment_collections,*items,*items.variant,*items.product",
      },
      headers,
      next,
      cache: "no-store",
    })
    .then(({ orders }) => orders)
    .catch(() => [] as HttpTypes.StoreOrder[])
}
