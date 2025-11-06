import { describe, expect, it, beforeEach } from "vitest"
import { mockMedusaClient } from "./index"

describe("mockMedusaClient", () => {
  beforeEach(async () => {
    await mockMedusaClient.reset()
  })

  it("returns the default region", async () => {
    const region = await mockMedusaClient.getDefaultRegion()
    expect(region.id).toBe("reg_mock_global")
    expect(region.countries).toContain("dk")
  })

  it("adds and updates line items", async () => {
    await mockMedusaClient.addLineItem({
      productId: "1",
      title: "A320 CDU",
      unitPrice: 499.99,
      quantity: 1,
    })

    let cart = await mockMedusaClient.retrieveCart()
    expect(cart.items).toHaveLength(1)
    expect(cart.subtotal).toBeCloseTo(499.99)

    cart = await mockMedusaClient.updateLineItem("1-default", 2)
    expect(cart.items[0]?.quantity).toBe(2)
    expect(cart.items[0]?.total).toBeCloseTo(999.98)
  })

  it("lists product summaries with optional limit", async () => {
    const products = await mockMedusaClient.listProductSummaries(2)
    expect(products).toHaveLength(2)
    expect(products[0]?.handle).toBe("a320-cdu")
  })

  it("filters and retrieves products", async () => {
    const airbusProducts = await mockMedusaClient.listProducts({ collectionHandle: "airbus" })
    expect(airbusProducts.every((product) => product.category.includes("a320"))).toBe(true)

    const searchResults = await mockMedusaClient.listProducts({ search: "EFIS" })
    expect(searchResults[0]?.handle).toBe("737-efis")

    const product = await mockMedusaClient.retrieveProduct("a320-cdu")
    expect(product?.variants.length).toBeGreaterThan(0)
  })

  it("exposes collection, order, and address helpers", async () => {
    const [collections, featured, orders, addresses] = await Promise.all([
      mockMedusaClient.listCollections({ includeProducts: true }),
      mockMedusaClient.retrieveCollection("featured", { includeProducts: true }),
      mockMedusaClient.listRecentOrders(1),
      mockMedusaClient.listCustomerAddresses(),
    ])

    expect(collections[0]).toHaveProperty("products")
    expect(featured && "products" in featured ? featured.products.length : 0).toBeGreaterThan(0)
    expect(orders[0]?.display_id).toBe("#1001")
    expect(addresses[0]?.is_default).toBe(true)
  })

  it("retrieves orders by id", async () => {
    const order = await mockMedusaClient.retrieveOrder("order_01")
    expect(order?.items.length).toBeGreaterThan(1)
    expect(order?.shipping_address.city).toBe("San Jose")
  })
})
