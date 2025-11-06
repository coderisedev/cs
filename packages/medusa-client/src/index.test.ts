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

  it("exposes collection and order helpers", async () => {
    const [collections, featured, orders] = await Promise.all([
      mockMedusaClient.listCollections(),
      mockMedusaClient.retrieveCollection("featured"),
      mockMedusaClient.listRecentOrders(),
    ])

    expect(collections.length).toBeGreaterThan(1)
    expect(featured?.highlight).toBe("Hero")
    expect(orders[0]?.display_id).toBe("#1001")
  })
})
