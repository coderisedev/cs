"use client"

import { useState, useMemo } from "react"
import { BlogPostSummary } from "@/lib/blog/types"
import { Search, Clock, Calendar, ArrowRight } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

interface BlogListTemplateProps {
  posts: BlogPostSummary[]
  categories: string[]
}

export default function BlogListTemplate({
  posts,
  categories,
}: BlogListTemplateProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 6

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === "all" || post.category.toLowerCase() === selectedCategory.toLowerCase()
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory, posts])

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  
  // For pagination, skip the first post on page 1 (featured post)
  const paginatedPosts = currentPage === 1 
    ? filteredPosts.slice(1, endIndex)
    : filteredPosts.slice(startIndex, endIndex)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  return (
    <div className="container mx-auto px-4 lg:px-12 py-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-foreground-primary transition-colors duration-300">
          Flight Simulation Blog
        </h1>
        <p className="text-xl text-foreground-secondary max-w-3xl mx-auto transition-colors duration-300">
          Discover the latest insights, tutorials, and industry news in flight simulation technology
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary h-5 w-5" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background-secondary border border-border rounded-lg text-foreground-primary placeholder:text-foreground-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors duration-300"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              setSelectedCategory("all")
              setCurrentPage(1)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
              selectedCategory === "all"
                ? "bg-primary text-white"
                : "bg-background-secondary text-foreground-primary hover:bg-background-tertiary"
            }`}
          >
            All Posts
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category.toLowerCase())
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                selectedCategory === category.toLowerCase()
                  ? "bg-primary text-white"
                  : "bg-background-secondary text-foreground-primary hover:bg-background-tertiary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Post */}
      {currentPage === 1 && filteredPosts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground-primary transition-colors duration-300">
            Featured Article
          </h2>
          <div className="overflow-hidden rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 bg-background-secondary">
            <div className="md:flex">
              <div className="md:w-1/2 relative h-64 md:h-auto min-h-[400px] bg-background-tertiary">
                {filteredPosts[0].featuredImage && (
                  <Image
                    src={filteredPosts[0].featuredImage!}
                    alt={filteredPosts[0].title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                )}
              </div>
              <div className="md:w-1/2 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
                    {filteredPosts[0].category}
                  </span>
                  <div className="flex items-center text-foreground-secondary text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {filteredPosts[0].readTime} min read
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground-primary transition-colors duration-300">
                  {filteredPosts[0].title}
                </h3>
                <p className="text-foreground-secondary mb-4 transition-colors duration-300">
                  {filteredPosts[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {filteredPosts[0].author.avatar && (
                      <Image
                        src={filteredPosts[0].author.avatar!}
                        alt={filteredPosts[0].author.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground-primary">{filteredPosts[0].author.name}</p>
                      <p className="text-xs text-foreground-secondary">{formatDate(filteredPosts[0].publishedAt)}</p>
                    </div>
                  </div>
                  <LocalizedClientLink href={`/blog/${filteredPosts[0].slug}`}>
                    <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground-primary hover:bg-background-tertiary transition-colors group">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-2 inline group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </LocalizedClientLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Posts Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-foreground-primary transition-colors duration-300">
          {selectedCategory === "all" ? "Latest Articles" : categories.find(c => c.toLowerCase() === selectedCategory) || "Articles"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPosts.map((post) => (
            <div key={post.id} className="overflow-hidden rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 hover:transform hover:-translate-y-1 bg-background-secondary">
              <div className="relative h-48 w-full bg-background-tertiary">
                {post.featuredImage && (
                  <Image
                    src={post.featuredImage!}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-background-primary/90 text-foreground-primary text-sm rounded-full backdrop-blur-sm">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold leading-tight mb-2 text-foreground-primary hover:text-primary transition-colors duration-300">
                  <LocalizedClientLink href={`/blog/${post.slug}`}>
                    {post.title}
                  </LocalizedClientLink>
                </h3>
                <p className="text-foreground-secondary text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-foreground-secondary mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(post.publishedAt)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {post.readTime} min
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {post.author.avatar && (
                      <Image
                        src={post.author.avatar!}
                        alt={post.author.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-sm text-foreground-primary">{post.author.name}</span>
                  </div>
                  <LocalizedClientLink href={`/blog/${post.slug}`}>
                    <button className="text-primary hover:text-primary-hover text-sm font-medium transition-colors">
                      Read More
                    </button>
                  </LocalizedClientLink>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-background-elevated text-foreground-secondary text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground-primary hover:bg-background-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? "bg-primary text-white"
                  : "border border-border text-foreground-primary hover:bg-background-secondary"
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground-primary hover:bg-background-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-foreground-primary mb-2">No articles found</h3>
          <p className="text-foreground-secondary">Try adjusting your search terms or category filter.</p>
        </div>
      )}
    </div>
  )
}
