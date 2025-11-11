import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPostBySlug, getAllPosts } from "@/lib/data/blog"
import BlogDetailTemplate from "@/modules/blog/templates/blog-detail"

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: "Post Not Found | CockpitSim",
    }
  }

  return {
    title: `${post.title} | CockpitSim Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const [post, allPosts] = await Promise.all([
    getPostBySlug(slug),
    getAllPosts(),
  ])

  if (!post) {
    notFound()
  }

  // Get related posts by category or tags
  const relatedPosts = allPosts
    .filter((p) => {
      if (p.id === post.id) return false
      if (p.category === post.category) return true
      return p.tags.some((tag) => post.tags.includes(tag))
    })
    .slice(0, 3)

  return <BlogDetailTemplate post={post} relatedPosts={relatedPosts} />
}
