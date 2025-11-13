import { listPosts } from "@/lib/data/blog"
import { BlogPageClient } from "./blog-client"

export const metadata = {
  title: "Blog · Cockpit Simulator",
  description: "Insights, tutorials, and reviews for flight-sim builders",
}

export const revalidate = 300

type BlogPageProps = {
  params: Promise<{ countryCode: string }>
  searchParams?: Promise<{ page?: string | string[] }>
}

export default async function BlogPage(props: BlogPageProps) {
  const params = await props.params
  const searchParams = await props.searchParams || {}
  const pageParam = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page
  const page = pageParam ? Math.max(1, Number(pageParam) || 1) : 1
  const { posts, pagination, error } = await listPosts({ page })

  return (
    <BlogPageClient
      posts={posts}
      pagination={pagination}
      countryCode={params.countryCode}
      isUnavailable={Boolean(error)}
    />
  )
}
