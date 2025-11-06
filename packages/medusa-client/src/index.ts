export type MockRegion = {
  id: string
  name: string
  currency_code: string
  countries: string[]
  tax_rate: number
}

export type MockProductVariant = {
  id: string
  title: string
  price: number
  color?: string
  size?: string
  inStock: boolean
}

export type MockProduct = {
  id: string
  handle: string
  title: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: string
  collection?: string
  variants: MockProductVariant[]
  tags: string[]
  rating: number
  reviewCount: number
  inStock: boolean
  isNew?: boolean
  isSale?: boolean
  specifications?: Array<{ label: string; value: string }>
  compatibility?: string[]
  features?: string[]
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
  productHandles: string[]
}

export type MockCollectionWithProducts = MockCollection & {
  products: MockProductSummary[]
}

export type MockOrderItem = {
  id: string
  product_handle: string
  title: string
  variant_title: string
  quantity: number
  unit_price: number
  total: number
}

export type MockAddress = {
  id: string
  label: "shipping" | "billing"
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
  is_default: boolean
}

export type MockOrder = {
  id: string
  display_id: string
  status: "completed" | "pending"
  total: number
  created_at: string
  items: MockOrderItem[]
  shipping_address: MockAddress
  billing_address: MockAddress
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

const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "1",
    handle: "a320-cdu",
    title: "A320 CDU - Control Display Unit",
    description:
      "Professional-grade Airbus A320 Control Display Unit replica with authentic button layout and LED backlighting.",
    price: 499.99,
    compareAtPrice: 599.99,
    images: [
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800",
      "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800",
    ],
    category: "a320-series",
    collection: "featured",
    variants: [
      { id: "1-1", title: "Standard Edition", price: 499.99, inStock: true },
      { id: "1-2", title: "Pro Edition with Backlight", price: 599.99, inStock: true },
    ],
    tags: ["A320", "CDU", "Airbus", "Professional"],
    rating: 4.9,
    reviewCount: 127,
    inStock: true,
    isSale: true,
    specifications: [
      { label: "Dimensions", value: "8.5\" x 6\" x 2\"" },
      { label: "Weight", value: "2.2 lbs" },
      { label: "Connection", value: "USB 2.0" },
      { label: "Power", value: "USB Powered" },
      { label: "Material", value: "Aircraft-grade Aluminum" },
      { label: "Backlight", value: "Adjustable LED" },
    ],
    compatibility: [
      "Microsoft Flight Simulator 2024",
      "Microsoft Flight Simulator 2020",
      "X-Plane 12",
      "Prepar3D v5",
    ],
    features: [
      "Full-size authentic replica",
      "LED backlit keys",
      "Plug and play USB connection",
      "Compatible with major flight simulators",
      "Durable aircraft-grade construction",
      "Software configuration included",
    ],
  },
  {
    id: "2",
    handle: "737-mcp",
    title: "Boeing 737 MCP - Mode Control Panel",
    description:
      "Authentic Boeing 737 Mode Control Panel with rotary encoders, illuminated displays, and complete autopilot functionality.",
    price: 649.99,
    images: [
      "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800",
      "https://images.unsplash.com/photo-1583992056700-91e6242bfc45?w=800",
    ],
    category: "737-series",
    collection: "featured",
    variants: [
      { id: "2-1", title: "737 Classic", price: 649.99, inStock: true },
      { id: "2-2", title: "737 MAX", price: 749.99, inStock: true },
    ],
    tags: ["Boeing 737", "MCP", "Autopilot", "Professional"],
    rating: 4.8,
    reviewCount: 98,
    inStock: true,
    isNew: true,
    specifications: [
      { label: "Dimensions", value: "14\" x 4.5\" x 3\"" },
      { label: "Weight", value: "3.5 lbs" },
      { label: "Connection", value: "USB 3.0" },
      { label: "Displays", value: "LED Seven-Segment" },
      { label: "Encoders", value: "High-precision Rotary" },
      { label: "Switches", value: "Aviation-grade" },
    ],
    compatibility: [
      "Microsoft Flight Simulator 2024",
      "Microsoft Flight Simulator 2020",
      "X-Plane 12",
      "Prepar3D v5",
      "PMDG 737",
    ],
    features: [
      "Authentic MCP replica",
      "Precision rotary encoders",
      "Illuminated LED displays",
      "All autopilot functions",
      "Professional-grade switches",
      "Plug and play configuration",
    ],
  },
  {
    id: "3",
    handle: "737-efis",
    title: "Boeing 737 EFIS Control Panel",
    description:
      "Electronic Flight Instrument System control panel for Boeing 737 with authentic rotary selectors and weather radar settings.",
    price: 329.99,
    images: [
      "https://images.unsplash.com/photo-1569314572659-c4f4b620a4b5?w=800",
    ],
    category: "737-series",
    variants: [
      { id: "3-1", title: "Captain Side", price: 329.99, inStock: true },
      { id: "3-2", title: "First Officer Side", price: 329.99, inStock: true },
    ],
    tags: ["Boeing 737", "EFIS", "Navigation", "Display Control"],
    rating: 4.7,
    reviewCount: 76,
    inStock: true,
    specifications: [
      { label: "Dimensions", value: "6\" x 5\" x 2.5\"" },
      { label: "Weight", value: "1.8 lbs" },
      { label: "Connection", value: "USB 2.0" },
      { label: "Rotary Encoders", value: "6" },
      { label: "Switches", value: "8" },
    ],
    compatibility: [
      "Microsoft Flight Simulator 2024",
      "Microsoft Flight Simulator 2020",
      "X-Plane 12",
      "PMDG 737",
    ],
    features: [
      "Authentic EFIS panel layout",
      "Smooth rotary encoders",
      "Backlit labels",
      "Dual-side available",
      "Easy installation",
    ],
  },
  {
    id: "4",
    handle: "a320-fcu",
    title: "Airbus A320 FCU - Flight Control Unit",
    description:
      "Complete Airbus A320 Flight Control Unit with all autopilot controls, rotary knobs, and LED displays.",
    price: 749.99,
    compareAtPrice: 899.99,
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee67e4b8f2d3?w=800",
      "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800",
    ],
    category: "a320-series",
    collection: "featured",
    variants: [
      { id: "4-1", title: "Standard FCU", price: 749.99, inStock: true },
      { id: "4-2", title: "Pro FCU with EFIS", price: 999.99, inStock: true },
    ],
    tags: ["A320", "FCU", "Airbus", "Autopilot"],
    rating: 4.9,
    reviewCount: 143,
    inStock: true,
    isSale: true,
    specifications: [
      { label: "Dimensions", value: "18\" x 5\" x 3.5\"" },
      { label: "Weight", value: "4.2 lbs" },
      { label: "Connection", value: "USB 3.0" },
      { label: "Displays", value: "LED Dot Matrix" },
      { label: "Encoders", value: "12 High-precision Rotary" },
    ],
    compatibility: [
      "Microsoft Flight Simulator 2024",
      "Microsoft Flight Simulator 2020",
      "X-Plane 12",
      "Prepar3D v5",
      "FlyByWire A320",
    ],
    features: [
      "Full FCU functionality",
      "LED dot matrix displays",
      "Precision encoders",
      "All autopilot modes",
      "Professional construction",
      "Pre-configured software",
    ],
  },
]

const toSummary = (product: MockProduct): MockProductSummary => ({
  id: product.id,
  handle: product.handle,
  title: product.title,
  price: product.price,
  primaryImage: product.images[0] ?? "",
})

const productMap = new Map(MOCK_PRODUCTS.map((product) => [product.handle, product]))

const MOCK_COLLECTIONS: MockCollection[] = [
  {
    id: "col_featured",
    handle: "featured",
    title: "Featured Flight Deck",
    description: "Signature hardware bundles inspired by the cockpit simulator homepage.",
    heroImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    highlight: "Hero",
    productHandles: ["a320-cdu", "737-mcp", "a320-fcu"],
  },
  {
    id: "col_airbus",
    handle: "airbus",
    title: "Airbus Essentials",
    description: "CDU, FCU, and pedestal gear for A320 series fans.",
    heroImage: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800",
    highlight: "Airbus",
    productHandles: ["a320-cdu", "a320-fcu"],
  },
  {
    id: "col_boeing",
    handle: "boeing",
    title: "Boeing Suite",
    description: "MCP, EFIS, and throttle quadrants for 737 lovers.",
    heroImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    highlight: "Boeing",
    productHandles: ["737-mcp", "737-efis"],
  },
]

const collectionMap = new Map(MOCK_COLLECTIONS.map((collection) => [collection.handle, collection]))

const MOCK_ADDRESSES: MockAddress[] = [
  {
    id: "addr_home",
    label: "shipping",
    first_name: "Alex",
    last_name: "Chen",
    address_1: "123 Flight Deck Blvd",
    city: "San Jose",
    state: "CA",
    postal_code: "95112",
    country: "US",
    phone: "+1 555-0182",
    is_default: true,
  },
  {
    id: "addr_billing",
    label: "billing",
    first_name: "Alex",
    last_name: "Chen",
    address_1: "123 Flight Deck Blvd",
    city: "San Jose",
    state: "CA",
    postal_code: "95112",
    country: "US",
    phone: "+1 555-0182",
    is_default: true,
  },
]

const MOCK_ORDERS: MockOrder[] = [
  {
    id: "order_01",
    display_id: "#1001",
    status: "completed",
    total: 1499.99,
    created_at: "2025-02-14T10:00:00.000Z",
    items: [
      {
        id: "order_01_item_1",
        product_handle: "a320-cdu",
        title: "A320 CDU - Control Display Unit",
        variant_title: "Pro Edition with Backlight",
        quantity: 1,
        unit_price: 599.99,
        total: 599.99,
      },
      {
        id: "order_01_item_2",
        product_handle: "737-mcp",
        title: "Boeing 737 MCP - Mode Control Panel",
        variant_title: "737 MAX",
        quantity: 1,
        unit_price: 749.99,
        total: 749.99,
      },
    ],
    shipping_address: MOCK_ADDRESSES[0],
    billing_address: MOCK_ADDRESSES[1],
  },
  {
    id: "order_02",
    display_id: "#0999",
    status: "pending",
    total: 329.99,
    created_at: "2025-01-29T18:45:00.000Z",
    items: [
      {
        id: "order_02_item_1",
        product_handle: "737-efis",
        title: "Boeing 737 EFIS Control Panel",
        variant_title: "Captain Side",
        quantity: 1,
        unit_price: 329.99,
        total: 329.99,
      },
    ],
    shipping_address: MOCK_ADDRESSES[0],
    billing_address: MOCK_ADDRESSES[1],
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

const clone = <T>(payload: T): T => structuredClone(payload)

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

const getLineItemId = (productId: string, variantId?: string) => `${productId}-${variantId ?? "default"}`

const filterProducts = (options?: { collectionHandle?: string; search?: string; limit?: number }) => {
  let results = [...MOCK_PRODUCTS]
  if (options?.collectionHandle) {
    const collection = collectionMap.get(options.collectionHandle)
    if (collection) {
      results = results.filter((product) => collection.productHandles.includes(product.handle))
    } else {
      results = []
    }
  }

  if (options?.search) {
    const term = options.search.toLowerCase()
    results = results.filter((product) =>
      product.title.toLowerCase().includes(term) || product.description.toLowerCase().includes(term)
    )
  }

  if (typeof options?.limit === "number") {
    results = results.slice(0, Math.max(0, options.limit))
  }

  return results
}

export const mockMedusaClient = {
  async getDefaultRegion(): Promise<MockRegion> {
    await delay()
    return { ...DEFAULT_REGION }
  },

  async retrieveCart(): Promise<MockCart> {
    await delay()
    return clone(ensureCart())
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
    return clone(cart)
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
    return clone(cart)
  },

  async deleteLineItem(lineId: string): Promise<MockCart> {
    const cart = ensureCart()
    cart.items = cart.items.filter((item) => item.id !== lineId)
    recalcTotals(cart)
    await delay()
    return clone(cart)
  },

  async listProductSummaries(limit?: number): Promise<MockProductSummary[]> {
    await delay()
    const selection = typeof limit === "number" ? MOCK_PRODUCTS.slice(0, Math.max(0, limit)) : MOCK_PRODUCTS
    return selection.map(toSummary)
  },

  async listProducts(options?: { collectionHandle?: string; search?: string; limit?: number }): Promise<MockProduct[]> {
    await delay()
    return filterProducts(options).map((product) => clone(product))
  },

  async retrieveProduct(handle: string): Promise<MockProduct | undefined> {
    await delay()
    const product = productMap.get(handle)
    return product ? clone(product) : undefined
  },

  async listCollections(options?: { limit?: number; includeProducts?: boolean }): Promise<Array<MockCollection | MockCollectionWithProducts>> {
    await delay()
    let collections = [...MOCK_COLLECTIONS]
    if (typeof options?.limit === "number") {
      collections = collections.slice(0, Math.max(0, options.limit))
    }

    if (options?.includeProducts) {
      return collections.map((collection) => ({
        ...collection,
        products: collection.productHandles
          .map((handle) => productMap.get(handle))
          .filter(Boolean)
          .map((product) => toSummary(product as MockProduct)),
      }))
    }

    return collections.map((collection) => clone(collection))
  },

  async retrieveCollection(handle: string, options?: { includeProducts?: boolean }): Promise<(MockCollection | MockCollectionWithProducts) | undefined> {
    await delay()
    const collection = collectionMap.get(handle)
    if (!collection) {
      return undefined
    }

    if (options?.includeProducts) {
      return {
        ...collection,
        products: collection.productHandles
          .map((productHandle) => productMap.get(productHandle))
          .filter(Boolean)
          .map((product) => toSummary(product as MockProduct)),
      }
    }

    return clone(collection)
  },

  async listCollectionProducts(handle: string): Promise<MockProductSummary[]> {
    await delay()
    const collection = collectionMap.get(handle)
    if (!collection) {
      return []
    }
    return collection.productHandles
      .map((productHandle) => productMap.get(productHandle))
      .filter(Boolean)
      .map((product) => toSummary(product as MockProduct))
  },

  async listOrders(): Promise<MockOrder[]> {
    await delay()
    return MOCK_ORDERS.map((order) => clone(order))
  },

  async listRecentOrders(limit = 2): Promise<MockOrder[]> {
    const orders = await this.listOrders()
    return orders.slice(0, Math.max(0, limit))
  },

  async retrieveOrder(id: string): Promise<MockOrder | undefined> {
    await delay()
    const order = MOCK_ORDERS.find((entry) => entry.id === id)
    return order ? clone(order) : undefined
  },

  async listCustomerAddresses(): Promise<MockAddress[]> {
    await delay()
    return MOCK_ADDRESSES.map((address) => clone(address))
  },

  async reset(): Promise<MockCart> {
    inMemoryCart = createEmptyCart()
    await delay()
    return clone(inMemoryCart)
  },
}

export type MockMedusaClient = typeof mockMedusaClient
