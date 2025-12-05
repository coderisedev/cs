import type { MetadataRoute } from "next"
import { listPosts } from "@/lib/data/blog"
import { listProducts } from "@/lib/data/products"

const BASE_URL = process.env.STOREFRONT_BASE_URL || "https://dev.aidenlux.com"
const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/${DEFAULT_COUNTRY}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/${DEFAULT_COUNTRY}/store`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/${DEFAULT_COUNTRY}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/${DEFAULT_COUNTRY}/cart`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ]

  // Fetch all blog posts
  const blogEntries: MetadataRoute.Sitemap = []
  try {
    let page = 1
    let hasMore = true
    while (hasMore) {
      const result = await listPosts({ page, pageSize: 100 })
      for (const post of result.posts) {
        blogEntries.push({
          url: `${BASE_URL}/${DEFAULT_COUNTRY}/blog/${post.slug}`,
          lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        })
      }
      hasMore = page < result.pagination.pageCount
      page++
    }
  } catch (error) {
    console.error("[sitemap] Failed to fetch blog posts:", error)
  }

  // Fetch all products
  const productEntries: MetadataRoute.Sitemap = []
  try {
    let pageParam = 1
    let hasMore = true
    while (hasMore) {
      const { response, nextPage } = await listProducts({ pageParam, limit: 100 })
      for (const product of response.products) {
        productEntries.push({
          url: `${BASE_URL}/${DEFAULT_COUNTRY}/products/${product.handle}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        })
      }
      hasMore = nextPage !== null
      pageParam = nextPage ?? pageParam + 1
    }
  } catch (error) {
    console.error("[sitemap] Failed to fetch products:", error)
  }

  return [...staticPages, ...blogEntries, ...productEntries]
}
