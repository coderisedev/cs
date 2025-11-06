import type { Metadata } from "next"
import Image from "next/image"
import { getBlogPost, getBlogPosts } from "@/lib/data/blog"
import { notFound } from "next/navigation"

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
    title: `${post.title} · DJI Storefront` ,
    description: post.excerpt,
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="container py-16 space-y-6 max-w-3xl">
      <p className="text-xs uppercase tracking-widest text-foreground-muted">{post.category}</p>
      <h1 className="text-4xl font-semibold text-foreground-primary">{post.title}</h1>
      <p className="text-sm text-foreground-secondary">
        {new Date(post.publishDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {post.readTime} min read · {post.author}
      </p>
      <div className="relative h-80 w-full rounded-3xl overflow-hidden">
        <Image src={post.featuredImage} alt={post.title} fill className="object-cover" />
      </div>
      <p className="text-lg text-foreground-primary leading-relaxed">{post.content}</p>
    </article>
  )
}
