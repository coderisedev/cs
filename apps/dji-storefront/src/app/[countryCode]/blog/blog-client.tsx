"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, Search as SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { BlogPagination, BlogPost } from "@/lib/data/blog"

interface BlogPageClientProps {
  posts: BlogPost[]
  pagination: BlogPagination
  countryCode: string
  isUnavailable?: boolean
}

export function BlogPageClient({ posts, pagination, countryCode, isUnavailable }: BlogPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPosts = useMemo(() => {
    if (!searchTerm) {
      return posts
    }
    const matcher = searchTerm.toLowerCase()
    return posts.filter((post) => {
      return (
        post.title.toLowerCase().includes(matcher) ||
        post.excerpt.toLowerCase().includes(matcher) ||
        post.authorName?.toLowerCase().includes(matcher) ||
        post.content.toLowerCase().includes(matcher)
      )
    })
  }, [posts, searchTerm])

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const basePath = `/${countryCode}/blog`
  const pageCount = Math.max(1, pagination.pageCount)
  const prevPage = pagination.page > 1 ? pagination.page - 1 : null
  const nextPage = pagination.page < pageCount ? pagination.page + 1 : null
  const getPageHref = (page: number) => (page <= 1 ? basePath : `${basePath}?page=${page}`)

  const hasNoResults = filteredPosts.length === 0

  return (
    <div className="container py-16 space-y-10">
      <section className="text-center space-y-4">
        <p className="text-sm uppercase tracking-widest text-foreground-muted">Flight Simulation Blog</p>
        <h1 className="text-4xl font-semibold">Flight Simulation Insights</h1>
        <p className="max-w-3xl mx-auto text-foreground-secondary">
          Discover the latest tutorials, industry news, and product reviews curated for cockpit builders.
        </p>
      </section>

      <div className="space-y-6">
        <div className="relative max-w-md mx-auto">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
          <Input
            type="search"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {isUnavailable && (
          <div
            role="status"
            className="mx-auto max-w-2xl rounded-2xl border border-semantic-warning/40 bg-semantic-warning/10 px-4 py-3 text-sm text-semantic-warning"
          >
            Unable to reach Strapi right now. Showing cached content if available.
          </div>
        )}
      </div>

      {hasNoResults ? (
        <div className="rounded-3xl border border-dashed border-border-secondary bg-background-secondary/60 px-8 py-16 text-center">
          <p className="text-lg font-semibold text-foreground-primary">No articles yet</p>
          <p className="text-sm text-foreground-secondary">
            {searchTerm ? `We couldn't find posts matching “${searchTerm}”.` : "Publish a post in Strapi to see it here."}
          </p>
        </div>
      ) : (
        <section className="grid gap-6 md:grid-cols-2">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="group rounded-3xl border border-border-primary overflow-hidden bg-background-secondary transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative h-56 w-full overflow-hidden">
                {post.coverImageUrl ? (
                  <Image
                    src={post.coverImageUrl}
                    alt={post.coverImageAlt ?? post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-sm text-neutral-300">
                    Image coming soon
                  </div>
                )}
              </div>
              <div className="p-6 space-y-3">
                {post.authorName && <p className="text-xs uppercase tracking-widest text-primary-500">{post.authorName}</p>}
                <h2 className="text-2xl font-semibold text-foreground-primary">
                  <Link href={`${basePath}/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-sm text-foreground-secondary line-clamp-3">{post.excerpt}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted">
                  {formatDate(post.publishedAt) && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> {formatDate(post.publishedAt)}
                    </span>
                  )}
                  {post.estimatedReadingMinutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {post.estimatedReadingMinutes} min read
                    </span>
                  )}
                </div>
                <Link href={`${basePath}/${post.slug}`} className="text-primary-500 text-sm font-medium">
                  Read article →
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-4">
          {prevPage ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={getPageHref(prevPage)}>Previous</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}
          <span className="text-sm text-foreground-secondary">
            Page {pagination.page} of {pageCount}
          </span>
          {nextPage ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={getPageHref(nextPage)}>Next</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
