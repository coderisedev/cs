import { revalidateTag } from "next/cache"
import { getStrapiClient } from "@/lib/strapi/client"

const strapi = getStrapiClient()

const POPULATE_FIELDS = "*"
const DEFAULT_PAGE_SIZE = 6
const BLOG_REVALIDATE_SECONDS = 60

export const BLOG_CACHE_TAG = "blog"
export const BLOG_CATEGORIES_CACHE_TAG = "blog-categories"

type StrapiEntity<T> = T & {
  id: number
  documentId?: string
  createdAt?: string
  updatedAt?: string
  publishedAt?: string | null
  published_at?: string | null
  locale?: string | null
}

type StrapiMediaAttributes = {
  url: string
  alternativeText?: string | null
  caption?: string | null
  width?: number
  height?: number
}

type StrapiMediaData = StrapiMediaAttributes & {
  id: number
  documentId: string
}

type StrapiRelation<T> = {
  data: StrapiEntity<T> | null
} | null

export type StrapiPagination = {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

export type StrapiPostAttributes = {
  title: string
  slug: string
  excerpt?: string | null
  content?: string | null
  category?: string | null
  publish_date?: string | null
  cover_image?: StrapiMediaData[] | StrapiRelation<StrapiMediaAttributes>
  coverImage?: StrapiMediaData[] | StrapiRelation<StrapiMediaAttributes>
  author?: StrapiRelation<{
    name?: string | null
    title?: string | null
  }>
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
    ogImage?: StrapiRelation<StrapiMediaAttributes>
    metaImage?: StrapiRelation<StrapiMediaAttributes>
    shareImage?: StrapiRelation<StrapiMediaAttributes>
  }
}

export type StrapiPostResponse = {
  data: StrapiEntity<StrapiPostAttributes>[]
  meta: {
    pagination: StrapiPagination
  }
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string | null
  coverImageUrl: string | null
  coverImageAlt: string | null
  publishedAt: string | null
  authorName: string | null
  authorTitle: string | null
  estimatedReadingMinutes: number | null
  seo: {
    metaTitle?: string | null
    metaDescription?: string | null
    ogImageUrl?: string | null
  }
}

export type BlogCategory = {
  name: string
  slug: string
}

export type BlogPagination = StrapiPagination

export type BlogListOptions = {
  page?: number
  pageSize?: number
  locale?: string
  category?: string
  excludeCategory?: string
}

export type BlogListResult = {
  posts: BlogPost[]
  pagination: BlogPagination
  error?: string
}

const defaultPagination = ({ page = 1, pageSize = DEFAULT_PAGE_SIZE }: { page?: number; pageSize?: number }): StrapiPagination => ({
  page,
  pageSize,
  pageCount: 1,
  total: 0,
})

export const listPosts = async (options: BlogListOptions = {}): Promise<BlogListResult> => {
  "use server"
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
  const page = options.page ?? 1

  try {
    const response = await strapi.fetch<StrapiPostResponse>("/api/posts", {
      query: {
        populate: POPULATE_FIELDS,
        "sort[0]": "publish_date:desc",
        "sort[1]": "publishedAt:desc",
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        ...(options.locale ? { locale: options.locale } : {}),
        ...(options.category ? { "filters[category][$eq]": options.category } : {}),
        ...(options.excludeCategory ? { "filters[category][$ne]": options.excludeCategory } : {}),
      },
      tags: [BLOG_CACHE_TAG],
      revalidate: BLOG_REVALIDATE_SECONDS,
    })

    const pagination = response.meta?.pagination ?? defaultPagination({ page, pageSize })
    return {
      posts: response.data.map(mapStrapiPost),
      pagination,
    }
  } catch (error) {
    console.error("[blog] Failed to list posts", error)
    return {
      posts: [],
      pagination: defaultPagination({ page, pageSize }),
      error: error instanceof Error ? error.message : "Unknown Strapi error",
    }
  }
}

export const getPost = async (slug: string, locale?: string): Promise<BlogPost | null> => {
  "use server"
  try {
    const response = await strapi.fetch<StrapiPostResponse>("/api/posts", {
      query: {
        populate: POPULATE_FIELDS,
        "filters[slug][$eq]": slug,
        "pagination[page]": 1,
        "pagination[pageSize]": 1,
        ...(locale ? { locale } : {}),
      },
      tags: [BLOG_CACHE_TAG, `blog-post-${slug}`],
      revalidate: BLOG_REVALIDATE_SECONDS,
    })

    const entity = response.data[0]
    return entity ? mapStrapiPost(entity) : null
  } catch (error) {
    console.error(`[blog] Failed to fetch post ${slug}`, error)
    return null
  }
}

export const getFeaturedPosts = async (limit = 3, locale?: string) => {
  "use server"
  const { posts } = await listPosts({ pageSize: limit, locale })
  return posts
}

export const revalidateStrapiBlog = async () => {
  "use server"
  revalidateTag(BLOG_CACHE_TAG)
  revalidateTag(BLOG_CATEGORIES_CACHE_TAG)
}

export const getBlogCategories = async (): Promise<BlogCategory[]> => {
  "use server"
  try {
    const response = await strapi.fetch<StrapiPostResponse>("/api/posts", {
      query: {
        "fields[0]": "category",
        "pagination[page]": 1,
        "pagination[pageSize]": 200,
        sort: "category:asc",
      },
      tags: [BLOG_CATEGORIES_CACHE_TAG],
      revalidate: BLOG_REVALIDATE_SECONDS,
    })

    const unique = new Map<string, string>()
    response.data.forEach((entity) => {
      if (!entity.category) return
      const slug = slugifyCategory(entity.category)
      if (!slug) return
      if (!unique.has(slug)) {
        unique.set(slug, entity.category)
      }
    })

    return Array.from(unique.entries())
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error("[blog] Failed to fetch categories", error)
    return []
  }
}

const mapStrapiPost = (entity: StrapiEntity<StrapiPostAttributes>): BlogPost => {
  const coverMedia = entity.cover_image ?? entity.coverImage
  const coverImageUrl = extractMediaUrl(coverMedia)
  
  // Extract alt text from array or relation format
  let coverImageAlt: string | null = null
  if (coverMedia) {
    if (Array.isArray(coverMedia)) {
      coverImageAlt = coverMedia[0]?.alternativeText ?? null
    } else if ('data' in coverMedia) {
      coverImageAlt = coverMedia?.data?.alternativeText ?? null
    }
  }
  
  const seoImageUrl =
    extractMediaUrl(entity.seo?.ogImage) ||
    extractMediaUrl(entity.seo?.metaImage) ||
    extractMediaUrl(entity.seo?.shareImage) ||
    coverImageUrl

  return {
    id: String(entity.id),
    title: entity.title,
    slug: entity.slug,
    excerpt: entity.excerpt?.trim() || buildExcerpt(entity.content),
    content: entity.content ?? "",
    category: entity.category ?? null,
    coverImageUrl,
    coverImageAlt,
    publishedAt: entity.publish_date ?? entity.publishedAt ?? entity.published_at ?? null,
    authorName: entity.author?.data?.name ?? null,
    authorTitle: entity.author?.data?.title ?? null,
    estimatedReadingMinutes: estimateReadingTime(entity.content),
    seo: {
      metaTitle: entity.seo?.metaTitle ?? entity.title,
      metaDescription: entity.seo?.metaDescription ?? entity.excerpt ?? buildExcerpt(entity.content),
      ogImageUrl: seoImageUrl,
    },
  }
}

const extractMediaUrl = (media?: StrapiRelation<StrapiMediaAttributes> | StrapiMediaData[] | null) => {
  if (!media) {
    return null
  }
  
  // Handle array format (Strapi v5)
  if (Array.isArray(media)) {
    const url = media[0]?.url
    return url ? strapi.resolveMedia(url) : null
  }
  
  // Handle relation format (Strapi v4/v5)
  const url = media?.data?.url
  return url ? strapi.resolveMedia(url) : null
}

const estimateReadingTime = (content?: string | null) => {
  if (!content) {
    return null
  }
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

const buildExcerpt = (content?: string | null) => {
  if (!content) {
    return ""
  }
  const trimmed = content.trim()
  return trimmed.slice(0, 180).concat(trimmed.length > 180 ? "…" : "")
}

export const slugifyCategory = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
