import { BlogPost, BlogPostSummary } from './types'
import blogData from '@/data/blog-posts.json'

type BlogPostData = typeof blogData.posts

/**
 * Get all blog posts
 */
export function getAllPosts(): BlogPost[] {
  return blogData.posts as BlogPost[]
}

/**
 * Get all blog post summaries (without content)
 */
export function getAllPostSummaries(): BlogPostSummary[] {
  return blogData.posts.map(({ content, ...post }: any) => post) as BlogPostSummary[]
}

/**
 * Get a blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  const post = blogData.posts.find((p: any) => p.slug === slug)
  return post ? (post as BlogPost) : null
}

/**
 * Get blog posts by category
 */
export function getPostsByCategory(category: string): BlogPost[] {
  return blogData.posts.filter((p: any) => p.category.toLowerCase() === category.toLowerCase()) as BlogPost[]
}

/**
 * Get blog posts by tag
 */
export function getPostsByTag(tag: string): BlogPost[] {
  return blogData.posts.filter((p: any) => 
    p.tags.some((t: string) => t.toLowerCase() === tag.toLowerCase())
  ) as BlogPost[]
}

/**
 * Search blog posts by title or excerpt
 */
export function searchPosts(query: string): BlogPost[] {
  const lowerQuery = query.toLowerCase()
  return blogData.posts.filter((p) => 
    p.title.toLowerCase().includes(lowerQuery) ||
    p.excerpt.toLowerCase().includes(lowerQuery)
  ) as BlogPost[]
}

/**
 * Get featured posts
 */
export function getFeaturedPosts(limit?: number): BlogPost[] {
  const featured = blogData.posts.filter((p: any) => p.featured) as BlogPost[]
  return limit ? featured.slice(0, limit) : featured
}

/**
 * Get related posts (by category or tags)
 */
export function getRelatedPosts(post: BlogPost, limit: number = 3): BlogPost[] {
  const related = blogData.posts.filter((p: any) => {
    if (p.id === post.id) return false
    
    // Match by category
    if (p.category === post.category) return true
    
    // Match by tags
    return p.tags.some((tag: string) => post.tags.includes(tag))
  }) as BlogPost[]
  
  return related.slice(0, limit)
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  const categories = new Set(blogData.posts.map((p: any) => p.category))
  return Array.from(categories)
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const tags = new Set(blogData.posts.flatMap((p: any) => p.tags))
  return Array.from(tags)
}
