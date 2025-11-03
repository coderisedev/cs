export interface BlogAuthor {
  name: string
  avatar?: string
  bio?: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string // Markdown content
  author: BlogAuthor
  featuredImage?: string
  category: string
  tags: string[]
  readTime: number // in minutes
  publishedAt: string // ISO date string
  updatedAt?: string
  featured?: boolean
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
}

export type BlogPostSummary = Omit<BlogPost, 'content'>
