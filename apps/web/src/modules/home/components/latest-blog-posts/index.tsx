import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, Clock, Calendar } from "lucide-react"
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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Heading level="h2" className="text-3xl font-bold text-gray-900 mb-2">
              Latest Articles
            </Heading>
            <p className="text-gray-600">
              Stay updated with our latest insights and guides
            </p>
          </div>
          <LocalizedClientLink 
            href="/blog"
            className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            View All Articles
            <ArrowRight className="w-4 h-4" />
          </LocalizedClientLink>
        </div>

        {/* Blog Posts Grid - Horizontal Scroll on Mobile */}
        <div className="overflow-x-auto -mx-4 px-4 pb-4">
          <div className="flex gap-6 min-w-max sm:grid sm:grid-cols-3 sm:min-w-0">
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
                  className="group flex-shrink-0 w-80 sm:w-auto"
                >
                  <article className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                    {/* Featured Image */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200"></div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-700">
                        {post.category}
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto">
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
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                        {post.author.avatar && (
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {post.author.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </LocalizedClientLink>
              )
            })}
          </div>
        </div>

        {/* Mobile View All Link */}
        <div className="sm:hidden mt-6 text-center">
          <LocalizedClientLink 
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            View All Articles
            <ArrowRight className="w-4 h-4" />
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}
