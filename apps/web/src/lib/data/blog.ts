import 'server-only'

import { getStrapiClient } from '@lib/strapi/client'

const strapi = getStrapiClient()
const CACHE_TAG = 'blog'
const DEFAULT_REVALIDATE = 60

type StrapiMedia = {
  id?: number
  documentId?: string
  url?: string
  alternativeText?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
}

type StrapiAuthor = {
  name?: string | null
  title?: string | null
  avatar?: StrapiMedia | { data?: StrapiMedia | null } | null
}

type StrapiPostAttributes = {
  title: string
  slug: string
  excerpt?: string | null
  content?: string | null
  cover_image?: StrapiMedia[] | { data?: StrapiMedia | StrapiMedia[] | null } | null
  author?: StrapiAuthor | { data?: StrapiAuthor | null } | null
  category?: string | null
  tags?: string[] | null
  featured?: boolean | null
  publishedAt?: string | null
  published_at?: string | null
}

type StrapiEntity<T> = T & {
  id?: number
  documentId?: string
}

type StrapiPostResponse = {
  data: StrapiEntity<StrapiPostAttributes>[]
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    avatar?: string | null
  }
  featuredImage?: string | null
  category: string
  tags: string[]
  readTime: number
  publishedAt: string
  featured: boolean
}

export type BlogPostSummary = Omit<BlogPost, 'content'>

export const getAllPosts = async (): Promise<BlogPost[]> => {
  try {
    const response = await strapi.fetch<StrapiPostResponse>('/api/posts', {
      query: {
        sort: 'publishedAt:desc',
        populate: '*',
        'pagination[pageSize]': 100,
      },
      tags: [CACHE_TAG],
      revalidate: DEFAULT_REVALIDATE,
    })

    return response.data.map(mapPost)
  } catch (error) {
    console.error('[blog] Failed to fetch posts from Strapi:', error instanceof Error ? error.message : error)
    return []
  }
}

export const getAllPostSummaries = async (): Promise<BlogPostSummary[]> => {
  const posts = await getAllPosts()
  return posts.map(({ content, ...post }) => post)
}

export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const response = await strapi.fetch<StrapiPostResponse>('/api/posts', {
      query: {
        'filters[slug][$eq]': slug,
        populate: '*',
        'pagination[pageSize]': 1,
      },
      tags: [CACHE_TAG, `blog-post-${slug}`],
      revalidate: DEFAULT_REVALIDATE,
    })

    const entity = response.data?.[0]
    return entity ? mapPost(entity) : null
  } catch (error) {
    console.error(`[blog] Failed to fetch post ${slug}:`, error instanceof Error ? error.message : error)
    return null
  }
}

export const getFeaturedPosts = async (limit: number = 3): Promise<BlogPost[]> => {
  try {
    const response = await strapi.fetch<StrapiPostResponse>('/api/posts', {
      query: {
        'filters[featured][$eq]': true,
        sort: 'publishedAt:desc',
        populate: '*',
        'pagination[pageSize]': limit,
      },
      tags: [CACHE_TAG],
      revalidate: DEFAULT_REVALIDATE,
    })

    return response.data.map(mapPost)
  } catch (error) {
    console.error('[blog] Failed to fetch featured posts:', error instanceof Error ? error.message : error)
    return []
  }
}

export const getPostsByCategory = async (category: string): Promise<BlogPost[]> => {
  try {
    const response = await strapi.fetch<StrapiPostResponse>('/api/posts', {
      query: {
        'filters[category][$eq]': category,
        sort: 'publishedAt:desc',
        populate: '*',
        'pagination[pageSize]': 100,
      },
      tags: [CACHE_TAG, `blog-category-${category}`],
      revalidate: DEFAULT_REVALIDATE,
    })

    return response.data.map(mapPost)
  } catch (error) {
    console.error(`[blog] Failed to fetch posts for category ${category}:`, error instanceof Error ? error.message : error)
    return []
  }
}

export const getAllCategories = async (): Promise<string[]> => {
  const posts = await getAllPosts()
  const categories = new Set(posts.map(p => p.category))
  return Array.from(categories)
}

const mapPost = (entity: StrapiEntity<StrapiPostAttributes>): BlogPost => {
  const coverImageUrl = extractMediaUrl(entity.cover_image)
  const authorAvatar = extractMediaUrl(entity.author)
  
  const content = entity.content ?? ''
  const excerpt = entity.excerpt ?? buildExcerpt(content)
  
  return {
    id: entity.documentId ?? String(entity.id ?? ''),
    slug: entity.slug,
    title: entity.title,
    excerpt,
    content,
    author: {
      name: extractAuthorName(entity.author),
      avatar: authorAvatar,
    },
    featuredImage: coverImageUrl,
    category: entity.category ?? 'Uncategorized',
    tags: Array.isArray(entity.tags) ? entity.tags : [],
    readTime: estimateReadingTime(content),
    publishedAt: entity.publishedAt ?? entity.published_at ?? new Date().toISOString(),
    featured: Boolean(entity.featured),
  }
}

const extractMediaUrl = (media: any): string | null => {
  if (!media) {
    return null
  }

  // Handle array format (Strapi v5)
  if (Array.isArray(media)) {
    const url = media[0]?.url
    return url ? strapi.resolveMedia(url) : null
  }

  // Handle relation format
  if (media.data) {
    if (Array.isArray(media.data)) {
      const url = media.data[0]?.url
      return url ? strapi.resolveMedia(url) : null
    }
    const url = media.data?.url ?? media.data?.avatar?.url ?? media.data?.avatar?.data?.url
    return url ? strapi.resolveMedia(url) : null
  }

  // Handle direct media object
  const url = media.url ?? media.avatar?.url
  return url ? strapi.resolveMedia(url) : null
}

const extractAuthorName = (author: any): string => {
  if (!author) {
    return 'Anonymous'
  }

  if (author.data) {
    return author.data.name ?? 'Anonymous'
  }

  return author.name ?? 'Anonymous'
}

const estimateReadingTime = (content: string): number => {
  if (!content) {
    return 1
  }
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

const buildExcerpt = (content: string): string => {
  if (!content) {
    return ''
  }
  const trimmed = content.trim()
  return trimmed.slice(0, 180).concat(trimmed.length > 180 ? '…' : '')
}
