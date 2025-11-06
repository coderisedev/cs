"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, Search as SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { BlogPost, BlogCategory } from "@/lib/data/blog"

interface BlogPageClientProps {
  posts: BlogPost[]
  categories: BlogCategory[]
}

export function BlogPageClient({ posts, categories }: BlogPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 6

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || post.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [posts, searchTerm, selectedCategory])

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage))
  const startIndex = (currentPage - 1) * postsPerPage
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug)
    setCurrentPage(1)
  }

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
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange("all")}
          >
            All Posts
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        {paginatedPosts.map((post) => (
          <article
            key={post.id}
            className="group rounded-3xl border border-border-primary overflow-hidden bg-background-secondary transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="relative h-56 w-full overflow-hidden">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-6 space-y-3">
              <p className="text-xs uppercase tracking-widest text-primary-500">{post.category.replace("-", " ")}</p>
              <h2 className="text-2xl font-semibold text-foreground-primary">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="text-sm text-foreground-secondary line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center gap-4 text-xs text-foreground-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {formatDate(post.publishDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {post.readTime} min
                </span>
              </div>
              <Link href={`/blog/${post.slug}`} className="text-primary-500 text-sm font-medium">
                Read article →
              </Link>
            </div>
          </article>
        ))}
      </section>

      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-foreground-secondary">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
