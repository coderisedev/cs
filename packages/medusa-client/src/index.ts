export type MockRegion = {
  id: string
  name: string
  currency_code: string
  countries: string[]
  tax_rate: number
}

export type MockProductSummary = {
  id: string
  handle: string
  title: string
  price: number
  primaryImage: string
}

export type MockCollection = {
  id: string
  handle: string
  title: string
  description: string
  heroImage: string
  highlight: string
}

export type MockOrder = {
  id: string
  display_id: string
  status: "completed" | "pending"
  total: number
  created_at: string
}

export type CartLineItem = {
  id: string
  product_id: string
  title: string
  quantity: number
  unit_price: number
  total: number
  variant_id?: string
}

export type MockCart = {
  id: string
  region_id: string
  currency_code: string
  items: CartLineItem[]
  subtotal: number
  total: number
  created_at: string
  updated_at: string
}

export type AddLineItemInput = {
  productId: string
  title: string
  unitPrice: number
  variantId?: string
  quantity?: number
}

const DEFAULT_REGION: MockRegion = {
  id: "reg_mock_global",
  name: "Global Mock Region",
  currency_code: "usd",
  countries: ["us", "dk", "gb", "de", "cn", "jp"],
  tax_rate: 0,
}

const MOCK_PRODUCTS: MockProductSummary[] = [
  {
    id: "1",
    handle: "a320-cdu",
    title: "A320 CDU - Control Display Unit",
    price: 499.99,
    primaryImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800",
  },
  {
    id: "2",
    handle: "737-mcp",
    title: "Boeing 737 MCP - Mode Control Panel",
    price: 649.99,
    primaryImage: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800",
  },
  {
    id: "3",
    handle: "737-efis",
    title: "Boeing 737 EFIS Control Panel",
    price: 329.99,
    primaryImage: "https://images.unsplash.com/photo-1569314572659-c4f4b620a4b5?w=800",
  },
  {
    id: "4",
    handle: "a320-fcu",
    title: "Airbus A320 FCU - Flight Control Unit",
    price: 749.99,
    primaryImage: "https://images.unsplash.com/photo-1581092160607-ee67e4b8f2d3?w=800",
  },
]

const MOCK_COLLECTIONS: MockCollection[] = [
  {
    id: "col_featured",
    handle: "featured",
    title: "Featured Flight Deck",
    description: "Signature hardware bundles inspired by the cockpit simulator homepage.",
    heroImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    highlight: "Hero",
  },
  {
    id: "col_airbus",
    handle: "airbus",
    title: "Airbus Essentials",
    description: "CDU, FCU, and pedestal gear for A320 series fans.",
    heroImage: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800",
    highlight: "Airbus",
  },
  {
    id: "col_boeing",
    handle: "boeing",
    title: "Boeing Suite",
    description: "MCP, EFIS, and throttle quadrants for 737 lovers.",
    heroImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    highlight: "Boeing",
  },
]

const MOCK_ORDERS: MockOrder[] = [
  {
    id: "order_01",
    display_id: "#1001",
    status: "completed",
    total: 1499.99,
    created_at: "2025-02-14T10:00:00.000Z",
  },
  {
    id: "order_02",
    display_id: "#0999",
    status: "pending",
    total: 329.99,
    created_at: "2025-01-29T18:45:00.000Z",
  },
]

const nowIso = () => new Date().toISOString()

const createEmptyCart = (): MockCart => ({
  id: "cart_mock",
  region_id: DEFAULT_REGION.id,
  currency_code: DEFAULT_REGION.currency_code,
  items: [],
  subtotal: 0,
  total: 0,
  created_at: nowIso(),
  updated_at: nowIso(),
})

let inMemoryCart = createEmptyCart()

const delay = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms))

const cloneCart = (cart: MockCart): MockCart => structuredClone(cart)

const recalcTotals = (cart: MockCart): MockCart => {
  const subtotal = cart.items.reduce((sum, item) => sum + item.total, 0)
  cart.subtotal = Number(subtotal.toFixed(2))
  cart.total = cart.subtotal
  cart.updated_at = nowIso()
  return cart
}

const ensureCart = () => {
  if (!inMemoryCart) {
    inMemoryCart = createEmptyCart()
  }
  return inMemoryCart
}

const getLineItemId = (productId: string, variantId?: string) =>
  `${productId}-${variantId ?? "default"}`

export const mockMedusaClient = {
  async getDefaultRegion(): Promise<MockRegion> {
    await delay()
    return { ...DEFAULT_REGION }
  },

  async retrieveCart(): Promise<MockCart> {
    await delay()
    return cloneCart(ensureCart())
  },

  async addLineItem(input: AddLineItemInput): Promise<MockCart> {
    const { productId, title, unitPrice, variantId, quantity = 1 } = input

    if (!productId || !title) {
      throw new Error("productId and title are required")
    }

    const cart = ensureCart()
    const id = getLineItemId(productId, variantId)
    const existing = cart.items.find((item) => item.id === id)

    if (existing) {
      existing.quantity += quantity
      existing.total = Number((existing.quantity * existing.unit_price).toFixed(2))
    } else {
      cart.items.push({
        id,
        product_id: productId,
        title,
        quantity,
        unit_price: unitPrice,
        total: Number((unitPrice * quantity).toFixed(2)),
        variant_id: variantId,
      })
    }

    recalcTotals(cart)
    await delay()
    return cloneCart(cart)
  },

  async updateLineItem(lineId: string, quantity: number): Promise<MockCart> {
    const cart = ensureCart()
    const target = cart.items.find((item) => item.id === lineId)

    if (!target) {
      throw new Error(`Line item ${lineId} not found`)
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => item.id !== lineId)
    } else {
      target.quantity = quantity
      target.total = Number((target.unit_price * quantity).toFixed(2))
    }

    recalcTotals(cart)
    await delay()
    return cloneCart(cart)
  },

  async deleteLineItem(lineId: string): Promise<MockCart> {
    const cart = ensureCart()
    cart.items = cart.items.filter((item) => item.id !== lineId)
    recalcTotals(cart)
    await delay()
    return cloneCart(cart)
  },

  async listProductSummaries(limit?: number): Promise<MockProductSummary[]> {
    await delay()
    if (typeof limit === "number") {
      return MOCK_PRODUCTS.slice(0, Math.max(0, limit))
    }
    return [...MOCK_PRODUCTS]
  },

  async listCollections(limit?: number): Promise<MockCollection[]> {
    await delay()
    if (typeof limit === "number") {
      return MOCK_COLLECTIONS.slice(0, Math.max(0, limit))
    }
    return [...MOCK_COLLECTIONS]
  },

  async retrieveCollection(handle: string): Promise<MockCollection | undefined> {
    await delay()
    return MOCK_COLLECTIONS.find((collection) => collection.handle === handle)
  },

  async listRecentOrders(): Promise<MockOrder[]> {
    await delay()
    return [...MOCK_ORDERS]
  },

  async reset(): Promise<MockCart> {
    inMemoryCart = createEmptyCart()
    await delay()
    return cloneCart(inMemoryCart)
  },
}

export type MockMedusaClient = typeof mockMedusaClient
