"use client"

import { BlogPost } from "@/lib/blog/types"
import Image from "next/image"
import PostContent from "../components/post-content"
import RelatedPosts from "../components/related-posts"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Calendar, Clock, Eye, Heart, Share2 } from "lucide-react"
import { Button } from "@medusajs/ui"

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
    <div className="container mx-auto px-4 lg:px-12 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="transparent"
          onClick={() => window.history.back()}
          className="text-ui-fg-base hover:text-ui-fg-interactive group"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          {/* Category and Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Link
              href={`/blog?category=${category}`}
              className="px-3 py-1 bg-ui-bg-interactive text-ui-fg-on-color text-sm rounded-full hover:bg-ui-bg-interactive-hover transition-colors"
            >
              {category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Link>
            <div className="flex items-center text-ui-fg-subtle text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              {formattedDate}
            </div>
            <div className="flex items-center text-ui-fg-subtle text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {readTime} min read
            </div>
            <div className="flex items-center text-ui-fg-subtle text-sm">
              <Eye className="h-4 w-4 mr-1" />
              1250 views
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold mb-6 text-ui-fg-base leading-tight transition-colors duration-300">
            {title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-ui-fg-subtle mb-8 leading-relaxed transition-colors duration-300">
            {excerpt}
          </p>

          {/* Author and Actions */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div className="flex items-center space-x-4">
              {author.avatar && (
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-medium text-ui-fg-base">{author.name}</p>
                <p className="text-sm text-ui-fg-subtle">Flight Simulation Expert</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                onClick={handleLike}
                className={`transition-colors duration-300 ${
                  isLiked ? "text-red-500 border-red-500" : ""
                }`}
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`}
                />
                {likes}
              </Button>
              <Button variant="secondary" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {featuredImage && (
          <div className="mb-8">
            <div className="relative w-full h-64 lg:h-96 rounded-lg overflow-hidden shadow-elevation-card-rest">
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
        <div className="prose prose-lg max-w-none mb-12">
          <div className="text-ui-fg-base leading-relaxed transition-colors duration-300">
            <PostContent content={content} />
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-ui-fg-base">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${tag}`}
                  className="px-3 py-1 bg-ui-bg-subtle text-ui-fg-subtle text-sm rounded-full hover:bg-ui-bg-interactive hover:text-ui-fg-on-color transition-colors duration-300"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio */}
        <div className="mb-8 p-6 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
          <div className="flex items-start space-x-4">
            {author.avatar && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={author.avatar}
                  alt={author.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-ui-fg-base mb-2">
                {author.name}
              </h3>
              <p className="text-ui-fg-subtle mb-3">
                {author.name} is a certified flight instructor with over 15 years of
                experience in both real and simulated flight environments. Specializes
                in advanced flight simulation techniques and cockpit technology
                integration.
              </p>
              <div className="flex space-x-2">
                <Button variant="secondary" size="small">
                  Follow
                </Button>
                <Button variant="secondary" size="small">
                  Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-4xl mx-auto">
          <RelatedPosts posts={relatedPosts} />
        </section>
      )}
    </div>
  )
}
