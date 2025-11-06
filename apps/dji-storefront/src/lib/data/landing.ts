import { mockMedusaClient } from "@cs/medusa-client"

export type LandingSnapshot = Awaited<ReturnType<typeof getLandingSnapshot>>

export async function getLandingSnapshot() {
  const [region, cart, heroProducts, heroCollections, heroOrders] = await Promise.all([
    mockMedusaClient.getDefaultRegion(),
    mockMedusaClient.retrieveCart(),
    mockMedusaClient.listProductSummaries(3),
    mockMedusaClient.listCollections({ limit: 2, includeProducts: true }),
    mockMedusaClient.listRecentOrders(1),
  ])

  return {
    region,
    cart,
    heroProducts,
    heroCollections,
    heroOrders,
  }
}
