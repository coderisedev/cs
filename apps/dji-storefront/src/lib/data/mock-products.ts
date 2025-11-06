import { mockMedusaClient, type MockProduct } from "@cs/medusa-client"

export const getMockProducts = ({ limit = 12, offset = 0, collection_id }: { limit?: number; offset?: number; collection_id?: string }) => {
  const results = mockMedusaClient.listProducts({ collectionHandle: collection_id }) as MockProduct[]
  const products = results.slice(offset, offset + limit)
  return {
    products,
    count: results.length,
  }
}
