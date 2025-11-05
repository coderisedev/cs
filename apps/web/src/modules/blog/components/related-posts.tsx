import { Button, Heading, Text } from "@/components/ui"
import { BlogPost } from "@/lib/blog/types"
import { Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
      <Heading as="h2" size="md" className="mb-6">
        Related Articles
      </Heading>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {posts.map((post) => {
          const { content, ...postData } = post
          return (
            <div
              key={postData.id}
              className="group overflow-hidden rounded-2xl border border-border-base bg-surface-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
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
                <Heading
                  as="h3"
                  size="xs"
                  className="mb-2 leading-tight text-foreground-base transition-colors duration-200 group-hover:text-foreground-interactive"
                >
                  <Link href={`/blog/${postData.slug}`}>{postData.title}</Link>
                </Heading>
                <Text tone="subtle" className="mb-4 line-clamp-2 text-sm">
                  {postData.excerpt}
                </Text>
                <div className="flex items-center justify-between text-sm text-foreground-muted">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(postData.publishedAt)}
                  </div>
                  <Button variant="link" size="sm" className="px-0" asChild>
                    <Link href={`/blog/${postData.slug}`}>Read More</Link>
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
