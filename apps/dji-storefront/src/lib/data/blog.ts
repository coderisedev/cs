"use server"

import { revalidateTag } from "next/cache"
import { getStrapiClient } from "@/lib/strapi/client"

const strapi = getStrapiClient()

const POPULATE_FIELDS = ["cover_image", "coverImage", "author", "seo", "seo.ogImage", "seo.metaImage", "seo.shareImage"].join(",")
const DEFAULT_PAGE_SIZE = 6
const BLOG_REVALIDATE_SECONDS = 60

export const BLOG_CACHE_TAG = "blog"

type StrapiEntity<T> = {
  id: number
  attributes: T & {
    createdAt?: string
    updatedAt?: string
    publishedAt?: string | null
    published_at?: string | null
    locale?: string | null
  }
}

type StrapiMediaAttributes = {
  url: string
  alternativeText?: string | null
  caption?: string | null
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
  cover_image?: StrapiRelation<StrapiMediaAttributes>
  coverImage?: StrapiRelation<StrapiMediaAttributes>
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

export type BlogPagination = StrapiPagination

export type BlogListOptions = {
  page?: number
  pageSize?: number
  locale?: string
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
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
  const page = options.page ?? 1

  try {
    const response = await strapi.fetch<StrapiPostResponse>("/api/posts", {
      query: {
        populate: POPULATE_FIELDS,
        sort: "publishedAt:desc",
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        ...(options.locale ? { locale: options.locale } : {}),
        publicationState: "live",
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
  try {
    const response = await strapi.fetch<StrapiPostResponse>("/api/posts", {
      query: {
        populate: POPULATE_FIELDS,
        "filters[slug][$eq]": slug,
        "pagination[page]": 1,
        "pagination[pageSize]": 1,
        ...(locale ? { locale } : {}),
        publicationState: "live",
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
  const { posts } = await listPosts({ pageSize: limit, locale })
  return posts
}

export const revalidateStrapiBlog = async () => {
  "use server"
  revalidateTag(BLOG_CACHE_TAG)
}

const mapStrapiPost = (entity: StrapiEntity<StrapiPostAttributes>): BlogPost => {
  const { id, attributes } = entity
  const coverMedia = attributes.cover_image ?? attributes.coverImage
  const coverImageUrl = extractMediaUrl(coverMedia)
  const coverImageAlt = coverMedia?.data?.attributes?.alternativeText ?? null
  const seoImageUrl =
    extractMediaUrl(attributes.seo?.ogImage) ||
    extractMediaUrl(attributes.seo?.metaImage) ||
    extractMediaUrl(attributes.seo?.shareImage) ||
    coverImageUrl

  return {
    id: String(id),
    title: attributes.title,
    slug: attributes.slug,
    excerpt: attributes.excerpt?.trim() || buildExcerpt(attributes.content),
    content: attributes.content ?? "",
    coverImageUrl,
    coverImageAlt,
    publishedAt: attributes.publishedAt ?? attributes.published_at ?? null,
    authorName: attributes.author?.data?.attributes?.name ?? null,
    authorTitle: attributes.author?.data?.attributes?.title ?? null,
    estimatedReadingMinutes: estimateReadingTime(attributes.content),
    seo: {
      metaTitle: attributes.seo?.metaTitle ?? attributes.title,
      metaDescription: attributes.seo?.metaDescription ?? attributes.excerpt ?? buildExcerpt(attributes.content),
      ogImageUrl: seoImageUrl,
    },
  }
}

const extractMediaUrl = (media?: StrapiRelation<StrapiMediaAttributes> | null) => {
  const url = media?.data?.attributes?.url
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
