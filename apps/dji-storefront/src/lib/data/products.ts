import { mockMedusaClient, type MockProduct, type MockProductSummary } from "@cs/medusa-client"

export type ProductListOptions = {
  collectionHandle?: string
  search?: string
  limit?: number
}

export async function getProductSummaries(limit?: number): Promise<MockProductSummary[]> {
  return mockMedusaClient.listProductSummaries(limit)
}

export async function getProducts(options?: ProductListOptions): Promise<MockProduct[]> {
  return mockMedusaClient.listProducts(options)
}

export async function getProductDetail(handle: string): Promise<MockProduct | undefined> {
  return mockMedusaClient.retrieveProduct(handle)
}
