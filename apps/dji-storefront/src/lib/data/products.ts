import { mockMedusaClient, type MockProduct, type MockProductSummary } from "@cs/medusa-client"

export type ProductListOptions = {
  collectionHandle?: string
  search?: string
  limit?: number
}

export type ProductCategory = {
  id: string
  title: string
}

const categories: ProductCategory[] = [
  { id: "all", title: "All Categories" },
  { id: "a320-series", title: "Airbus A320 Series" },
  { id: "737-series", title: "Boeing 737 Series" },
  { id: "777-series", title: "Boeing 777 Series" },
  { id: "accessories", title: "Accessories & Mounts" },
]

export async function getProductSummaries(limit?: number): Promise<MockProductSummary[]> {
  return mockMedusaClient.listProductSummaries(limit)
}

export async function getProducts(options?: ProductListOptions): Promise<MockProduct[]> {
  return mockMedusaClient.listProducts(options)
}

export async function getProductDetail(handle: string): Promise<MockProduct | undefined> {
  return mockMedusaClient.retrieveProduct(handle)
}

export const getProductCategories = () => categories
