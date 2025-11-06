import { mockMedusaClient, type MockAddress, type MockOrder, type MockProduct } from "@cs/medusa-client"

export type AccountAddress = {
  id: string
  type: "shipping" | "billing"
  firstName: string
  lastName: string
  address1: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
}

export type AccountPreferences = {
  notifications: boolean
  newsletter: boolean
  language: string
  currency: string
}

export type AccountUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar: string
  phone: string
  dateJoined: string
  preferences: AccountPreferences
  addresses: AccountAddress[]
}

export type AccountOrderItem = {
  id: string
  title: string
  variantTitle: string
  quantity: number
  price: number
}

export type AccountOrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

export type AccountOrder = {
  id: string
  orderNumber: string
  date: string
  status: AccountOrderStatus
  total: number
  trackingNumber?: string
  estimatedDelivery?: string
  items: AccountOrderItem[]
}

export type WishlistProduct = {
  id: string
  handle: string
  title: string
  description: string
  price: number
  image: string
}

export type WishlistItem = {
  id: string
  addedDate: string
  product: WishlistProduct
}

const regionDisplay = typeof Intl.DisplayNames !== "undefined" ? new Intl.DisplayNames(["en"], { type: "region" }) : null

const ORDER_ENRICHMENTS: Record<
  string,
  {
    status: AccountOrderStatus
    trackingNumber?: string
    estimatedDelivery?: string
  }
> = {
  order_01: {
    status: "delivered",
    trackingNumber: "TRK123456789",
    estimatedDelivery: "2025-02-20",
  },
  order_02: {
    status: "shipped",
    trackingNumber: "TRK987654321",
    estimatedDelivery: "2025-02-05",
  },
}

const STATUS_SEQUENCE: AccountOrderStatus[] = ["delivered", "shipped", "processing", "pending"]

const WISHLIST_ENTRIES = [
  { id: "wishlist_1", handle: "a320-cdu", addedDate: "2025-02-01" },
  { id: "wishlist_2", handle: "a320-fcu", addedDate: "2025-01-22" },
  { id: "wishlist_3", handle: "737-fcu", addedDate: "2025-01-18" },
]

const formatCountry = (countryCode: string) => {
  if (!countryCode) return ""
  return regionDisplay?.of(countryCode.toUpperCase()) ?? countryCode.toUpperCase()
}

const mapAddress = (address: MockAddress): AccountAddress => ({
  id: address.id,
  type: address.label,
  firstName: address.first_name,
  lastName: address.last_name,
  address1: address.address_1,
  city: address.city,
  state: address.state,
  postalCode: address.postal_code,
  country: formatCountry(address.country),
  phone: address.phone,
  isDefault: address.is_default,
})

const mapOrder = (order: MockOrder, index: number): AccountOrder => {
  const enrichment = ORDER_ENRICHMENTS[order.id]
  const status = enrichment?.status ?? STATUS_SEQUENCE[index % STATUS_SEQUENCE.length]

  return {
    id: order.id,
    orderNumber: order.display_id,
    date: order.created_at,
    status,
    total: order.total,
    trackingNumber: enrichment?.trackingNumber,
    estimatedDelivery: enrichment?.estimatedDelivery,
    items: order.items.map((item) => ({
      id: item.id,
      title: item.title,
      variantTitle: item.variant_title,
      quantity: item.quantity,
      price: item.total,
    })),
  }
}

const mapWishlistProduct = (product: MockProduct): WishlistProduct => ({
  id: product.id,
  handle: product.handle,
  title: product.title,
  description: product.description,
  price: product.price,
  image: product.images[0] ?? "",
})

export const getAddresses = async (): Promise<AccountAddress[]> => {
  const addresses = await mockMedusaClient.listCustomerAddresses()
  return addresses.map(mapAddress)
}

export const getOrders = async (): Promise<AccountOrder[]> => {
  const orders = await mockMedusaClient.listOrders()
  return orders.map(mapOrder)
}

export const getWishlist = async (): Promise<WishlistItem[]> => {
  const products = await Promise.all(
    WISHLIST_ENTRIES.map(async (entry) => {
      const product = await mockMedusaClient.retrieveProduct(entry.handle)
      if (!product) return undefined
      return {
        id: entry.id,
        addedDate: entry.addedDate,
        product: mapWishlistProduct(product),
      }
    })
  )

  return products.filter((item): item is WishlistItem => Boolean(item))
}

const buildUser = (addresses: AccountAddress[]): AccountUser => ({
  id: "user_1",
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  phone: "+1 (555) 123-4567",
  dateJoined: "2023-01-15",
  preferences: {
    notifications: true,
    newsletter: true,
    language: "English (US)",
    currency: "USD ($)",
  },
  addresses,
})

export const getUser = async (addresses?: AccountAddress[]): Promise<AccountUser> => {
  const resolvedAddresses = addresses ?? (await getAddresses())
  return buildUser(resolvedAddresses)
}

export const getAccountPageData = async () => {
  const [orders, addresses, wishlist] = await Promise.all([getOrders(), getAddresses(), getWishlist()])
  const user = await getUser(addresses)
  return { user, orders, addresses, wishlist }
}
