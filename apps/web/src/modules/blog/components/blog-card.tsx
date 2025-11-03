import { BlogPostSummary } from "@/lib/blog/types"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock } from "lucide-react"
import { Button } from "@medusajs/ui"

interface BlogCardProps {
  post: BlogPostSummary
  featured?: boolean
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const {
    slug,
    title,
    excerpt,
    author,
    featuredImage,
    category,
    tags,
    readTime,
    publishedAt,
  } = post

  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div
      className={`overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base hover:shadow-elevation-card-hover transition-all duration-300 hover:transform hover:-translate-y-1 ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      <div className="relative">
        {featuredImage && (
          <div
            className={`relative w-full overflow-hidden ${
              featured ? "h-64 md:h-96" : "h-48"
            }`}
          >
            <Image
              src={featuredImage}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}
        {category && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-ui-bg-base/90 text-ui-fg-base text-sm rounded-full backdrop-blur-sm">
              {category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>
        )}
      </div>
      <div className={`p-4 ${featured ? "md:p-6" : ""}`}>
        <h3
          className={`font-semibold leading-tight hover:text-ui-fg-interactive transition-colors duration-300 mb-2 ${
            featured ? "text-2xl" : "text-lg"
          }`}
        >
          <Link href={`/blog/${slug}`}>{title}</Link>
        </h3>
        <p
          className={`text-ui-fg-subtle mb-4 ${
            featured ? "line-clamp-3" : "line-clamp-2"
          }`}
        >
          {excerpt}
        </p>
        <div className="flex items-center justify-between text-sm text-ui-fg-subtle mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formattedDate}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {readTime} min
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {author.avatar && (
              <div className="relative w-6 h-6 rounded-full overflow-hidden">
                <Image
                  src={author.avatar}
                  alt={author.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <span className="text-sm text-ui-fg-base">{author.name}</span>
          </div>
          <Link href={`/blog/${slug}`}>
            <Button
              variant="transparent"
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover p-0 h-auto"
            >
              Read More
            </Button>
          </Link>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-ui-bg-subtle text-ui-fg-subtle text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
