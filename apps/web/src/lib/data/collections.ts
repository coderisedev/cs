"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"
import {
  getMockCollectionByHandle,
  getMockCollectionById,
  getMockCollections,
} from "./mock-data"

export const retrieveCollection = async (id: string) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }
  try {
    return await sdk.client
      .fetch<{ collection: HttpTypes.StoreCollection }>(
        `/store/collections/${id}`,
        {
          next,
          cache: "force-cache",
        }
      )
      .then(({ collection }) => collection)
  } catch (error) {
    const mock = getMockCollectionById(id)
    if (!mock) {
      throw error
    }
    return mock
  }
}

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  try {
    return await sdk.client
      .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
        "/store/collections",
        {
          query: queryParams,
          next,
          cache: "force-cache",
        }
      )
      .then(({ collections, count }) => ({ collections, count }))
  } catch (error) {
    return getMockCollections(queryParams)
  }
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  try {
    return await sdk.client
      .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
        query: {
          handle,
          // TODO: The fields parameter causes issues with the Medusa backend
          // fields: "*products"
        },
        next,
        cache: "force-cache",
      })
      .then(({ collections }) => collections[0])
  } catch (error) {
    const mock = getMockCollectionByHandle(handle)
    if (!mock) {
      throw error
    }
    return mock
  }
}
