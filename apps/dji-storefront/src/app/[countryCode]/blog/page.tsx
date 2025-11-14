import { getBlogCategories, listPosts } from "@/lib/data/blog"
import { BlogPageClient } from "./blog-client"

export const metadata = {
  title: "Blog · Cockpit Simulator",
  description: "Insights, tutorials, and reviews for flight-sim builders",
}

export const revalidate = 300

type BlogPageProps = {
  params: Promise<{ countryCode: string }>
  searchParams?: Promise<{ page?: string | string[]; category?: string | string[] }>
}

export default async function BlogPage(props: BlogPageProps) {
  const params = await props.params
  const searchParams = (await props.searchParams) || {}
  const pageParam = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page
  const page = pageParam ? Math.max(1, Number(pageParam) || 1) : 1
  const categoryParam = Array.isArray(searchParams.category) ? searchParams.category[0] : searchParams.category

  const categories = await getBlogCategories()
  const activeCategory = categories.find((category) => category.slug === categoryParam)

  const { posts, pagination, error } = await listPosts({ page, category: activeCategory?.name })

  return (
    <BlogPageClient
      posts={posts}
      pagination={pagination}
      countryCode={params.countryCode}
      categories={categories}
      activeCategory={activeCategory?.slug ?? null}
      isUnavailable={Boolean(error)}
    />
  )
}
