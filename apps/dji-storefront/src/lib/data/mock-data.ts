import { mockMedusaClient, type MockProduct } from "@cs/medusa-client"

export const getMockProducts = ({ limit = 12, offset = 0, collection_id }: { limit?: number; offset?: number; collection_id?: string }) => {
  const result = mockMedusaClient.listProducts({ collectionHandle: collection_id })
  // Handle both array and object responses
  const results = Array.isArray(result) ? result : (result as any).products || []
  const products = results.slice(offset, offset + limit)
  return {
    products,
    count: results.length,
  }
}
