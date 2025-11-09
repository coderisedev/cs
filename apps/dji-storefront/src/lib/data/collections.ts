"use server"

import { sdk } from "@/lib/medusa"
import { getCacheOptions } from "@/lib/server/cookies"
import { HttpTypes } from "@medusajs/types"

export const listCollections = async (queryParams: Record<string, string> = {}) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  const query = {
    limit: queryParams.limit ?? "100",
    offset: queryParams.offset ?? "0",
    ...queryParams,
  }

  try {
    return await sdk.client
      .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>("/store/collections", {
        method: "GET",
        query,
        next,
        cache: "force-cache",
      })
      .then(({ collections, count }) => ({ collections, count }))
  } catch (error) {
    console.error("Failed to fetch collections:", error)
    return { collections: [], count: 0 }
  }
}

export const retrieveCollection = async (id: string) => {
  const next = {
    ...(await getCacheOptions(`collections-${id}`)),
  }

  try {
    return await sdk.client
      .fetch<{ collection: HttpTypes.StoreCollection }>(`/store/collections/${id}`, {
        method: "GET",
        next,
        cache: "force-cache",
      })
      .then(({ collection }) => collection)
  } catch (error) {
    console.error(`Failed to fetch collection ${id}:`, error)
    return null
  }
}

export const getCollectionByHandle = async (handle: string) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  try {
    return await sdk.client
      .fetch<{ collections: HttpTypes.StoreCollection[] }>(`/store/collections`, {
        method: "GET",
        query: { handle },
        next,
        cache: "force-cache",
      })
      .then(({ collections }) => collections[0] ?? null)
  } catch (error) {
    console.error(`Failed to fetch collection by handle ${handle}:`, error)
    return null
  }
}

export const getCollections = async ({
  limit,
  includeProducts,
}: {
  limit?: number
  includeProducts?: boolean
} = {}) => {
  const { collections } = await listCollections(
    limit ? { limit: limit.toString() } : {}
  )

  if (!includeProducts) {
    return collections.map((collection) => ({ ...collection, products: undefined }))
  }

  return collections
}

export const getCollectionDetail = async (handle: string) => {
  try {
    return await getCollectionByHandle(handle)
  } catch {
    return null
  }
}
