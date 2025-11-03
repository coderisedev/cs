import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"
import {
  getMockCategories,
  getMockCategoryByHandle,
} from "./mock-data"

export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  try {
    return await sdk.client
      .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
        "/store/product-categories",
        {
          query: {
            fields:
              "*category_children, *products, *parent_category, *parent_category.parent_category",
            limit,
            ...query,
          },
          next,
          cache: "force-cache",
        }
      )
      .then(({ product_categories }) => product_categories)
  } catch (error) {
    return getMockCategories(limit)
  }
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  try {
    return await sdk.client
      .fetch<HttpTypes.StoreProductCategoryListResponse>(
        `/store/product-categories`,
        {
          query: {
            // TODO: The fields parameter causes issues with the Medusa backend
            // fields: "*category_children, *products",
            handle,
          },
          next,
          cache: "force-cache",
        }
      )
      .then(({ product_categories }) => product_categories[0])
  } catch (error) {
    const mock = getMockCategoryByHandle(handle)
    if (!mock) {
      throw error
    }
    return mock
  }
}
