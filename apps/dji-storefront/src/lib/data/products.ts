"use server"

import { sdk } from "@/lib/medusa"
import { getAuthHeaders, getCacheOptions } from "@/lib/server/cookies"
import { getRegion, retrieveRegion } from "@/lib/data/regions"
import { getMockProducts } from "@/lib/data/mock-data"
import { HttpTypes } from "@medusajs/types"
import type { MockProduct, MockProductVariant } from "@cs/medusa-client"

export type StorefrontProductVariant = {
  id: string
  title: string
  price: number
  inStock: boolean
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
    const fallback = await getMockProducts({ limit, offset, collection_id: queryParams.collection_id as string | undefined })
    const nextPage = fallback.count > offset + limit ? pageParam + 1 : null
    return { response: { products: mapMockProducts(fallback.products), count: fallback.count }, nextPage }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("products")),
  }

  try {
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

    // If no products returned, fall back to mock data
    if (!products || products.length === 0) {
      console.log("No products returned from API, falling back to mock data")
      const fallback = await getMockProducts({ limit, offset, collection_id: queryParams.collection_id as string | undefined })
      const nextPage = fallback.count > offset + limit ? pageParam + 1 : null
      return { response: { products: mapMockProducts(fallback.products), count: fallback.count }, nextPage }
    }

    const nextPage = count > offset + limit ? pageParam + 1 : null

    return { response: { products: products.map(mapStoreProduct), count }, nextPage }
  } catch (error) {
    console.log("Error fetching products from API, falling back to mock data:", error)
    const fallback = await getMockProducts({ limit, offset, collection_id: queryParams.collection_id as string | undefined })
    const nextPage = fallback.count > offset + limit ? pageParam + 1 : null
    return { response: { products: mapMockProducts(fallback.products), count: fallback.count }, nextPage }
  }
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
    const fallback = await getMockProducts({ limit: 50, offset: 0 })
    const match = fallback.products.find((product: MockProduct) => product.handle === handle)
    return match ? mapMockProduct(match) : null
  }
}

const resolveRegion = async ({ countryCode, regionId }: { countryCode?: string; regionId?: string }) => {
  if (countryCode) {
    return (await getRegion(countryCode))
  }
  if (regionId) {
    return await retrieveRegion(regionId)
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
  const cheapestVariant: any = product.variants?.length
    ? product.variants
        .filter((v: any) => !!v.calculated_price)
        .sort((a: any, b: any) => {
          return (
            (a.calculated_price?.calculated_amount ?? 0) -
            (b.calculated_price?.calculated_amount ?? 0)
          )
        })[0]
    : null

  // Extract price from calculated_price object (Medusa v2 format)
  const priceAmount = toCurrencyAmount(cheapestVariant?.calculated_price?.calculated_amount) ?? 0
  const originalPriceAmount = toCurrencyAmount(cheapestVariant?.calculated_price?.original_amount)
  const compareAt =
    originalPriceAmount !== undefined && originalPriceAmount !== priceAmount
      ? originalPriceAmount
      : undefined

  const variants: StorefrontProductVariant[] =
    product.variants?.map((variant: any) => {
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

const mapMockProducts = (products: MockProduct[]) => products.map(mapMockProduct)

const mapMockProduct = (product: MockProduct): StorefrontProduct => ({
  id: product.id,
  handle: product.handle,
  title: product.title,
  description: product.description,
  price: product.price,
  compareAtPrice: product.compareAtPrice,
  images: buildImageGallery(product.images?.[0], product.images),
  rating: product.rating ?? 4.8,
  reviewCount: product.reviewCount ?? 32,
  inStock: product.inStock ?? true,
  isNew: product.isNew ?? false,
  tags: product.tags ?? [],
  category: product.category,
  collection: product.collection,
  variants: product.variants?.map((variant: MockProductVariant) => ({
    id: variant.id,
    title: variant.title,
    price: variant.price,
    inStock: variant.inStock,
  })) ?? [{ id: product.id, title: "Standard", price: product.price, inStock: product.inStock ?? true }],
})
