import { Heading, Text } from "@/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, Clock, Calendar } from "lucide-react"
import Image from "next/image"
import blogData from "../../../../data/blog-posts.json"

export default function LatestBlogPosts() {
  // Get the 3 most recent posts
  const latestPosts = blogData.posts
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3)

  if (!latestPosts.length) {
    return null
  }

  return (
    <section className="bg-surface-primary py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Heading as="h2" size="lg" className="mb-2">
              Latest Articles
            </Heading>
            <Text tone="subtle">
              Stay updated with our latest insights and guides
            </Text>
          </div>
          <LocalizedClientLink 
            href="/blog"
            className="hidden items-center gap-2 text-sm font-semibold text-foreground-interactive transition-colors hover:text-foreground-interactive/80 sm:flex"
          >
            View All Articles
            <ArrowRight className="w-4 h-4" />
          </LocalizedClientLink>
        </div>

        {/* Blog Posts Grid - Horizontal Scroll on Mobile */}
        <div className="-mx-4 overflow-x-auto px-4 pb-4">
          <div className="flex min-w-max gap-6 sm:grid sm:min-w-0 sm:grid-cols-3">
            {latestPosts.map((post) => {
              const publishDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })

              return (
                <LocalizedClientLink
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group w-80 flex-shrink-0 sm:w-auto"
                >
                  <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border-base bg-surface-secondary transition-shadow duration-300 group-hover:shadow-xl">
                    {/* Featured Image */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-surface-secondary to-surface-primary">
                      {post.featuredImage ? (
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 80vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200"></div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute left-4 top-4 rounded-full bg-surface-primary/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground-base backdrop-blur">
                        {post.category}
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="flex flex-1 flex-col p-6">
                      {/* Title */}
                      <Heading
                        as="h3"
                        size="xs"
                        className="mb-3 line-clamp-2 transition-colors duration-200 group-hover:text-foreground-interactive"
                      >
                        {post.title}
                      </Heading>

                      {/* Excerpt */}
                      <Text tone="subtle" className="mb-4 line-clamp-3 flex-1 text-sm">
                        {post.excerpt}
                      </Text>

                      {/* Meta Info */}
                      <div className="mt-auto flex items-center gap-4 text-sm text-foreground-muted">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{publishDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime} min read</span>
                        </div>
                      </div>

                      {/* Author */}
                      <div className="mt-4 flex items-center gap-3 border-t border-border-base pt-4">
                        {post.author.avatar && (
                          <Image
                            src={post.author.avatar}
                            alt={post.author.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        )}
                        <Text variant="body-sm" weight="semibold">
                          {post.author.name}
                        </Text>
                      </div>
                    </div>
                  </article>
                </LocalizedClientLink>
              )
            })}
          </div>
        </div>

        {/* Mobile View All Link */}
        <div className="mt-6 text-center sm:hidden">
          <LocalizedClientLink 
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground-interactive transition-colors hover:text-foreground-interactive/80"
          >
            View All Articles
            <ArrowRight className="w-4 h-4" />
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}
