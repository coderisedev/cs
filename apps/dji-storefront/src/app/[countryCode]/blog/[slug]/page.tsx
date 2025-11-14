import type { Metadata } from "next"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import { notFound } from "next/navigation"
import { Calendar, Clock, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPost, listPosts } from "@/lib/data/blog"

export const revalidate = 300

export async function generateStaticParams() {
  const firstPage = await listPosts({ page: 1, pageSize: 50 })
  if (!firstPage.posts.length) {
    return []
  }

  const allPosts = [...firstPage.posts]
  for (let page = 2; page <= firstPage.pagination.pageCount; page += 1) {
    const pageResult = await listPosts({ page, pageSize: 50 })
    allPosts.push(...pageResult.posts)
  }

  return allPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) {
    return { title: "Blog", description: "Flight simulation stories" }
  }
  return {
    title: post.seo.metaTitle ?? `${post.title} · Cockpit Simulator`,
    description: post.seo.metaDescription ?? post.excerpt,
    openGraph: {
      title: post.seo.metaTitle ?? post.title,
      description: post.seo.metaDescription ?? post.excerpt,
      images: post.seo.ogImageUrl ? [{ url: post.seo.ogImageUrl, alt: post.title }] : undefined,
    },
  }
}

const markdownComponents: Components = {
  h2: ({ className, children, ...props }) => (
    <h2 {...props} className={cn("text-2xl font-semibold text-foreground-primary mt-8 mb-4", className)}>
      {children}
    </h2>
  ),
  h3: ({ className, children, ...props }) => (
    <h3 {...props} className={cn("text-xl font-semibold text-foreground-primary mt-6 mb-3", className)}>
      {children}
    </h3>
  ),
  p: ({ className, children, ...props }) => (
    <p {...props} className={cn("text-lg leading-relaxed text-foreground-secondary", className)}>
      {children}
    </p>
  ),
  ul: ({ className, children, ...props }) => (
    <ul {...props} className={cn("list-disc pl-6 space-y-2 text-foreground-secondary", className)}>
      {children}
    </ul>
  ),
  ol: ({ className, children, ...props }) => (
    <ol {...props} className={cn("list-decimal pl-6 space-y-2 text-foreground-secondary", className)}>
      {children}
    </ol>
  ),
  a: ({ className, children, href, ...props }) => (
    <a
      {...props}
      href={href ?? "#"}
      className={cn("text-primary-500 underline", className)}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
}

type BlogPostPageProps = {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null

  return (
    <article className="container py-16 space-y-8 max-w-3xl">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-primary-500">DJI Blog</p>
        <h1 className="text-4xl font-semibold text-foreground-primary">{post.title}</h1>
        <div className="flex flex-wrap gap-4 text-xs text-foreground-muted">
          {formattedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {formattedDate}
            </span>
          )}
          {post.estimatedReadingMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {post.estimatedReadingMinutes} min read
            </span>
          )}
          {post.authorName && (
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" /> {post.authorName}
              {post.authorTitle && <span className="text-foreground-secondary"> · {post.authorTitle}</span>}
            </span>
          )}
        </div>
      </div>

      {post.coverImageUrl ? (
        <div className="relative h-80 w-full rounded-3xl overflow-hidden">
          <Image src={post.coverImageUrl} alt={post.coverImageAlt ?? post.title} fill className="object-cover" />
        </div>
      ) : (
        <div className="h-80 w-full rounded-3xl bg-neutral-900 flex items-center justify-center text-neutral-300">
          Cover image coming soon
        </div>
      )}

      <div className="space-y-4 text-lg text-foreground-primary leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
          {post.content}
        </ReactMarkdown>
     </div>
    </article>
  )
}
