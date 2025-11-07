"use server"

import { sdk } from "@/lib/medusa"
import { getAuthHeaders, getCacheOptions } from "@/lib/server/cookies"
import { getRegion, retrieveRegion } from "@/lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import { US_REGION_ID } from "@/lib/constants"

export type StorefrontProductVariant = {
  id: string
  title: string
  price: number
  inStock: boolean
}

type PricedVariant = HttpTypes.StoreProductVariant & {
  calculated_price?: {
    calculated_amount?: number | null
    original_amount?: number | null
  }
}

export type StorefrontProduct = {
  id: string
  handle: string
  title: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  rating: number
  reviewCount: number
  inStock: boolean
  isNew: boolean
  tags: string[]
  category?: string
  collection?: string
  variants: StorefrontProductVariant[]
}

export type ProductListOptions = HttpTypes.FindParams & HttpTypes.StoreProductListParams & { countryCode?: string; regionId?: string }

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

const toCurrencyAmount = (value?: number | null) => {
  if (value === null || value === undefined) {
    return undefined
  }

  const numericValue = typeof value === "number" ? value : Number(value)

  if (Number.isNaN(numericValue)) {
    return undefined
  }

  return numericValue
}

export const getProductCategories = async () => categories

export const getProductSummaries = async (options?: ProductListOptions) => {
  const { response } = await listProducts({ limit: 4, ...options })
  return response.products.slice(0, 4)
}

export const getProducts = async (options?: ProductListOptions) => {
  const { response } = await listProducts({ ...options })
  return response.products
}

export const getProductDetail = async (handle: string, countryCode?: string, regionId?: string) => {
  return retrieveProduct(handle, countryCode, regionId)
}

export const listProducts = async ({
  pageParam = 1,
  countryCode,
  regionId,
  ...queryParams
}: ProductListOptions & { pageParam?: number }) => {
  const limit = queryParams.limit ?? 12
  const offset = pageParam === 1 ? 0 : (pageParam - 1) * limit

  const region = await resolveRegion({ countryCode, regionId })

  if (!region) {
    throw new Error("Unable to resolve region for product listing")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("products")),
  }

  const { products, count } = await sdk.client.fetch<{
    products: HttpTypes.StoreProduct[]
    count: number
  }>(`/store/products`, {
    method: "GET",
    query: {
      limit,
      offset,
      region_id: region.id,
      fields: "+variants.inventory_quantity,+variants.calculated_price",
      ...queryParams,
    },
    headers,
    next,
    cache: "force-cache",
  })

  const nextPage = count > offset + limit ? pageParam + 1 : null

  return { response: { products: products.map(mapStoreProduct), count }, nextPage }
}

export const retrieveProduct = async (handle: string, countryCode?: string, regionId?: string) => {
  const region = await resolveRegion({ countryCode, regionId })

  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions(`product-${handle}`)),
  }

  try {
    // Medusa v2 API: Use list endpoint with handle filter to get product by handle
    const { products } = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[]
    }>(`/store/products`, {
      method: "GET",
      query: {
        handle,
        region_id: region?.id,
        fields: "+variants.inventory_quantity,+variants.calculated_price",
      },
      headers,
      next,
      cache: "force-cache",
    })

    if (!products || products.length === 0) {
      return null
    }

    return mapStoreProduct(products[0])
  } catch {
    return null
  }
}

const resolveRegion = async ({ countryCode, regionId }: { countryCode?: string; regionId?: string }) => {
  if (regionId) {
    try {
      return await retrieveRegion(regionId)
    } catch {
      // ignore and try other strategies
    }
  }

  if (countryCode) {
    try {
      const region = await getRegion(countryCode)
      if (region) {
        return region
      }
    } catch {
      // ignore and use default region
    }
  }

  if (US_REGION_ID) {
    try {
      return await retrieveRegion(US_REGION_ID)
    } catch {
      return null
    }
  }

  return null
}

const buildImageGallery = (
  thumbnail?: string | null,
  images?: Array<{ url?: string } | string>
) => {
  const gallery = (images ?? [])
    .map((image) => {
      if (typeof image === "string") {
        return image
      }

      return image?.url ?? ""
    })
    .filter((url): url is string => Boolean(url))

  if (thumbnail) {
    const existingIndex = gallery.indexOf(thumbnail)

    if (existingIndex > 0) {
      gallery.splice(existingIndex, 1)
    }

    if (existingIndex !== 0) {
      gallery.unshift(thumbnail)
    }
  }

  return gallery
}

const mapStoreProduct = (product: HttpTypes.StoreProduct): StorefrontProduct => {
  // Get the cheapest variant for base price calculation
  const productVariants = (product.variants ?? []) as PricedVariant[]
  const cheapestVariant = productVariants.length
    ? productVariants
        .filter((variant) => Boolean(variant.calculated_price))
        .sort((a, b) => {
          return (
            (a.calculated_price?.calculated_amount ?? 0) -
            (b.calculated_price?.calculated_amount ?? 0)
          )
        })[0]
    : null

  // Extract price from calculated_price object (Medusa v2 format)
  const priceAmount = toCurrencyAmount(cheapestVariant?.calculated_price?.calculated_amount) ?? 0
  const originalPriceAmount = toCurrencyAmount(cheapestVariant?.calculated_price?.original_amount)
  const price = priceAmount
  const compareAt =
    originalPriceAmount !== undefined && originalPriceAmount !== priceAmount
      ? originalPriceAmount
      : undefined

  const variants: StorefrontProductVariant[] =
    productVariants.map((variant) => {
      const variantPrice = toCurrencyAmount(variant.calculated_price?.calculated_amount) ?? priceAmount
      return {
        id: variant.id,
        title: variant.title ?? "Default",
        price: variantPrice,
        inStock: (variant.inventory_quantity ?? 0) > 0,
      }
    }) ?? []

  const inStock = variants.length ? variants.some((v) => v.inStock) : true

  return {
    id: product.id,
    handle: product.handle ?? product.id,
    title: product.title ?? "Untitled",
    description: product.description ?? "",
    price,
    compareAtPrice: compareAt,
    images: buildImageGallery(product.thumbnail, product.images),
    rating: (product.metadata?.rating as number) ?? 4.8,
    reviewCount: (product.metadata?.review_count as number) ?? 32,
    inStock,
    isNew: Boolean(product.metadata?.is_new),
    tags: product.tags?.map((tag) => tag.value ?? tag.id ?? "") ?? [],
    category: product.categories?.[0]?.handle,
    collection: product.collection?.handle,
    variants: variants.length ? variants : [{ id: product.id, title: "Standard", price, inStock }],
  }
}
