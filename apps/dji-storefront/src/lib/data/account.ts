"use server"

import { sdk } from "@/lib/medusa"
import { getAuthHeaders, getCacheOptions } from "@/lib/server/cookies"
import { listOrders } from "@/lib/data/orders"
import { HttpTypes } from "@medusajs/types"

export type AccountAddress = {
  id: string
  firstName: string
  lastName: string
  company?: string | null
  address1: string
  address2?: string | null
  city: string
  province?: string | null
  postalCode: string
  country: string
  countryCode: string
  phone?: string | null
  isDefaultShipping: boolean
  isDefaultBilling: boolean
}
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
  id: address.id,
  firstName: address.first_name ?? "",
  lastName: address.last_name ?? "",
  company: address.company ?? null,
  address1: address.address_1 ?? "",
  address2: address.address_2 ?? null,
  city: address.city ?? "",
  province: address.province ?? null,
  postalCode: address.postal_code ?? "",
  country: address.country_code?.toUpperCase() ?? "",
  countryCode: address.country_code ?? "",
  phone: address.phone ?? null,
  isDefaultShipping: Boolean(
    address.is_default_shipping ?? address.metadata?.is_default_shipping
  ),
  isDefaultBilling: Boolean(
    address.is_default_billing ?? address.metadata?.is_default_billing
  ),
})

const extractPreferences = (customer: HttpTypes.StoreCustomer | null): AccountUser["preferences"] => {
  const metadata = (customer?.metadata?.preferences as Record<string, unknown>) || {}

  const toBoolean = (value: unknown, fallback: boolean) => {
    if (typeof value === "boolean") return value
    if (typeof value === "string") return value === "true"
    return fallback
  }

  const toStringValue = (value: unknown, fallback: string) => {
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
    return fallback
  }

  return {
    notifications: toBoolean(metadata.notifications, true),
    newsletter: toBoolean(metadata.newsletter, true),
    language: toStringValue(metadata.language, "English (US)"),
    currency: toStringValue(metadata.currency, "USD ($)"),
  }
}

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
  try {
    return await listOrders()
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
        avatar: (customer.metadata?.avatar as string) ?? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        phone: customer.phone ?? "",
        dateJoined: customer.created_at instanceof Date ? customer.created_at.toISOString() : (customer.created_at ?? ""),
        preferences: extractPreferences(customer),
        addresses,
      }
    : null

  return { user, orders, addresses, wishlist: await getWishlist() }
}
