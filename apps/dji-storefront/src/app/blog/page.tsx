import Link from "next/link"
import Image from "next/image"
import { getBlogPosts, getBlogCategories } from "@/lib/data/blog"

export const metadata = {
  title: "Blog · DJI Storefront",
  description: "Insights, tutorials, and reviews for flight-sim builders",
}

export default function BlogPage() {
  const posts = getBlogPosts()
  const categories = getBlogCategories()

  return (
    <div className="container py-16 space-y-10">
      <section className="text-center space-y-4">
        <p className="text-sm uppercase tracking-widest text-foreground-muted">Flight Simulation Blog</p>
        <h1 className="text-4xl font-semibold">Stories from the cockpit</h1>
        <p className="max-w-2xl mx-auto text-foreground-secondary">
          Discover the latest insights, tutorials, and industry news in flight simulation technology.
        </p>
      </section>

      <section className="flex flex-wrap gap-3 justify-center">
        {categories.map((category) => (
          <span key={category.id} className="rounded-full border border-border-secondary px-4 py-2 text-sm text-foreground-secondary">
            {category.name}
          </span>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.id} className="rounded-3xl border border-border-primary overflow-hidden bg-background-secondary">
            <div className="relative h-56 w-full">
              <Image src={post.featuredImage} alt={post.title} fill className="object-cover" />
            </div>
            <div className="p-6 space-y-3">
              <p className="text-xs uppercase tracking-widest text-foreground-muted">{post.category}</p>
              <h2 className="text-2xl font-semibold text-foreground-primary">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="text-sm text-foreground-secondary line-clamp-3">{post.excerpt}</p>
              <div className="text-xs text-foreground-muted">
                {new Date(post.publishDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {post.readTime} min read
              </div>
              <Link href={`/blog/${post.slug}`} className="text-primary-500 text-sm font-medium">
                Read article →
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
