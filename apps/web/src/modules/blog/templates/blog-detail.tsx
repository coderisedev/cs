"use client"

import { Button, Heading, Text, cn } from "@/components/ui"
import { BlogPost } from "@/lib/blog/types"
import { ArrowLeft, Calendar, Clock, Eye, Heart, Share2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

import PostContent from "../components/post-content"
import RelatedPosts from "../components/related-posts"

interface BlogDetailTemplateProps {
  post: BlogPost
  relatedPosts: BlogPost[]
}

export default function BlogDetailTemplate({
  post,
  relatedPosts,
}: BlogDetailTemplateProps) {
  const {
    title,
    excerpt,
    content,
    author,
    featuredImage,
    category,
    tags,
    readTime,
    publishedAt,
    updatedAt,
  } = post

  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(125) // Mock initial likes

  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const updatedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: excerpt,
        url: window.location.href,
      })
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-12">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="group px-0 text-foreground-base hover:text-foreground-interactive"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
      </div>

      {/* Article */}
      <article className="mx-auto max-w-4xl">
        <header className="mb-8">
          {/* Category and Meta */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Link
              href={`/blog?category=${category}`}
              className="rounded-full bg-[hsl(var(--dji-color-surface-interactive))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--dji-color-foreground-on-color))] transition-colors hover:bg-[hsl(var(--dji-color-surface-interactive-hover))]"
            >
              {category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Link>
            <div className="flex items-center text-sm text-foreground-muted">
              <Calendar className="h-4 w-4 mr-1" />
              {formattedDate}
            </div>
            <div className="flex items-center text-sm text-foreground-muted">
              <Clock className="h-4 w-4 mr-1" />
              {readTime} min read
            </div>
            <div className="flex items-center text-sm text-foreground-muted">
              <Eye className="h-4 w-4 mr-1" />
              1250 views
            </div>
          </div>

          {/* Title */}
          <Heading as="h1" size="xl" className="mb-6 leading-tight">
            {title}
          </Heading>

          {/* Excerpt */}
          <Text variant="body-lg" tone="subtle" className="mb-8 leading-relaxed">
            {excerpt}
          </Text>

          {/* Author and Actions */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {author.avatar && (
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <Text weight="semibold">{author.name}</Text>
                <Text variant="body-sm" tone="subtle">
                  Flight Simulation Expert
                </Text>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={handleLike}
                size="sm"
                className={cn("transition-colors duration-300", {
                  "border-[hsl(var(--dji-color-status-error))] text-[hsl(var(--dji-color-status-error))]":
                    isLiked,
                })}
              >
                <Heart
                  className={cn("mr-2 h-4 w-4", isLiked && "fill-current")}
                />
                {likes}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {featuredImage && (
          <div className="mb-8">
            <div className="relative h-64 w-full overflow-hidden rounded-3xl shadow-xl lg:h-96">
              <Image
                src={featuredImage}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg mb-12 max-w-none text-foreground-base">
          <PostContent content={content} />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-8">
            <Heading as="h3" size="xs" className="mb-4">
              Tags
            </Heading>
            <div className="flex flex-wrap gap-2 text-sm">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${tag}`}
                  className="rounded-full bg-surface-secondary px-3 py-1 text-foreground-muted transition-colors duration-200 hover:bg-[hsl(var(--dji-color-surface-interactive))] hover:text-[hsl(var(--dji-color-foreground-on-color))]"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio */}
        <div className="mb-8 rounded-3xl border border-border-base bg-surface-secondary p-6">
          <div className="flex items-start gap-4">
            {author.avatar && (
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
                <Image
                  src={author.avatar}
                  alt={author.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <Heading as="h3" size="xs" className="mb-2">
                {author.name}
              </Heading>
              <Text tone="subtle" className="mb-3">
                {author.name} is a certified flight instructor with over 15 years of
                experience in both real and simulated flight environments. Specializes
                in advanced flight simulation techniques and cockpit technology
                integration.
              </Text>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  Follow
                </Button>
                <Button variant="secondary" size="sm">
                  Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="mx-auto max-w-4xl">
          <RelatedPosts posts={relatedPosts} />
        </section>
      )}
    </div>
  )
}
