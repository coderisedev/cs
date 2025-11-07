import type { Metadata } from "next"
import Image from "next/image"
import { getBlogPost, getBlogPosts } from "@/lib/data/blog"
import { notFound } from "next/navigation"
import { Calendar, Clock, User } from "lucide-react"

export async function generateStaticParams() {
  const posts = getBlogPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getBlogPost(params.slug)
  if (!post) {
    return { title: "Blog", description: "Flight simulation stories" }
  }
  return {
    title: `${post.title} · DJI Storefront`,
    description: post.excerpt,
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  const formattedDate = new Date(post.publishDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <article className="container py-16 space-y-8 max-w-3xl">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-primary-500">{post.category.replace("-", " ")}</p>
        <h1 className="text-4xl font-semibold text-foreground-primary">{post.title}</h1>
        <div className="flex flex-wrap gap-4 text-xs text-foreground-muted">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> {post.readTime} min read
          </span>
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" /> {post.author}
          </span>
        </div>
      </div>

      <div className="relative h-80 w-full rounded-3xl overflow-hidden">
        <Image src={post.featuredImage} alt={post.title} fill className="object-cover" />
      </div>

      <div className="text-sm text-foreground-secondary flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-border-secondary px-3 py-1">
            #{tag}
          </span>
        ))}
      </div>

      <p className="text-lg text-foreground-primary leading-relaxed">{post.content}</p>
    </article>
  )
}
