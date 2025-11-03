import { BlogPost } from "@/lib/blog/types"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@medusajs/ui"
import { Calendar } from "lucide-react"

interface RelatedPostsProps {
  posts: BlogPost[]
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-ui-fg-base">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => {
          const { content, ...postData } = post
          return (
            <div
              key={postData.id}
              className="overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base hover:shadow-elevation-card-hover transition-all duration-300 hover:transform hover:-translate-y-1"
            >
              <div className="relative">
                {postData.featuredImage && (
                  <div className="relative w-full h-48">
                    <Image
                      src={postData.featuredImage}
                      alt={postData.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold leading-tight hover:text-ui-fg-interactive transition-colors duration-300 mb-2">
                  <Link href={`/blog/${postData.slug}`}>{postData.title}</Link>
                </h3>
                <p className="text-ui-fg-subtle text-sm line-clamp-2 mb-4">
                  {postData.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-ui-fg-subtle">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(postData.publishedAt)}
                  </div>
                  <Link href={`/blog/${postData.slug}`}>
                    <Button variant="transparent" className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover p-0 h-auto">
                      Read More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
