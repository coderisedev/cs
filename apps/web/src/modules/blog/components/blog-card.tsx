import { Button, Heading, Text, cn } from "@/components/ui"
import { BlogPostSummary } from "@/lib/blog/types"
import { Calendar, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
      className={cn(
        "group overflow-hidden rounded-3xl border border-border-base bg-surface-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        featured && "md:col-span-2"
      )}
    >
      <div className="relative">
        {featuredImage && (
          <div
            className={cn(
              "relative w-full overflow-hidden",
              featured ? "h-64 md:h-96" : "h-48"
            )}
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
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-surface-primary/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground-base backdrop-blur">
              {category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>
        )}
      </div>
      <div className={cn("p-5", featured && "md:p-6")}>
        <Heading
          as="h3"
          size={featured ? "lg" : "sm"}
          className="mb-2 leading-tight text-foreground-base transition-colors duration-200 group-hover:text-foreground-interactive"
        >
          <Link href={`/blog/${slug}`}>{title}</Link>
        </Heading>
        <Text
          tone="subtle"
          className={cn("mb-4", featured ? "line-clamp-3" : "line-clamp-2")}
        >
          {excerpt}
        </Text>
        <div className="mb-4 flex items-center justify-between text-sm text-foreground-muted">
          <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-2">
            {author.avatar && (
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image
                  src={author.avatar}
                  alt={author.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <Text variant="body-sm" className="font-semibold">
              {author.name}
            </Text>
          </div>
          <Button variant="link" size="sm" className="px-0" asChild>
            <Link href={`/blog/${slug}`}>Read More</Link>
          </Button>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <Text
                key={tag}
                variant="caption"
                className="rounded-full bg-surface-secondary px-3 py-1 text-foreground-muted"
              >
                #{tag}
              </Text>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
