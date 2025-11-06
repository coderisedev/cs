"use server"

import { sdk } from "@/lib/medusa"
import { getAuthHeaders, getCacheOptions } from "@/lib/server/cookies"
import { HttpTypes } from "@medusajs/types"

export type AccountAddress = HttpTypes.StoreAddress & { isDefault: boolean }
export type AccountOrder = HttpTypes.StoreOrder
export type WishlistItem = {
  id: string
  addedDate: string
  product: HttpTypes.StoreProduct
}
export type AccountUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar: string
  phone: string
  dateJoined: string
  preferences: {
    notifications: boolean
    newsletter: boolean
    language: string
    currency: string
  }
  addresses: AccountAddress[]
}

const mapAddress = (address: HttpTypes.StoreCustomerAddress): AccountAddress => ({
  ...address,
  isDefault: Boolean(address.metadata?.is_default),
})

export const getAddresses = async () => {
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("account-addresses")),
  }

  try {
    const { addresses } = await sdk.client.fetch<{ addresses: HttpTypes.StoreCustomerAddress[] }>(`/store/customers/me/addresses`, {
      method: "GET",
      headers,
      next,
      cache: "no-store",
    })

    return addresses.map(mapAddress)
  } catch {
    return []
  }
}

export const getOrders = async () => {
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("account-orders")),
  }

  try {
    const { orders } = await sdk.client.fetch<{ orders: HttpTypes.StoreOrder[] }>(`/store/customers/me/orders`, {
      method: "GET",
      headers,
      next,
      cache: "no-store",
    })

    return orders
  } catch {
    return []
  }
}

export const getCustomer = async () => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const { customer } = await sdk.client.fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    return customer
  } catch {
    return null
  }
}

export const getWishlist = async (): Promise<WishlistItem[]> => []

export const getAccountPageData = async () => {
  const [customer, orders, addresses] = await Promise.all([getCustomer(), getOrders(), getAddresses()])
  const user: AccountUser | null = customer
    ? {
        id: customer.id,
        email: customer.email ?? "",
        firstName: customer.first_name ?? "",
        lastName: customer.last_name ?? "",
        avatar: customer.metadata?.avatar ?? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        phone: customer.phone ?? "",
        dateJoined: customer.created_at ?? "",
        preferences: {
          notifications: true,
          newsletter: true,
          language: "English (US)",
          currency: "USD ($)",
        },
        addresses,
      }
    : null

  return { user, orders, addresses, wishlist: await getWishlist() }
}
