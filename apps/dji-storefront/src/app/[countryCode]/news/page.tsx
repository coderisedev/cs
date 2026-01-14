import { listPosts } from "@/lib/data/blog"
import Link from "next/link"
import { Calendar } from "lucide-react"

export const metadata = {
  title: "News · Cockpit Simulator",
  description: "Latest news and announcements from Cockpit Simulator",
}

export const revalidate = 300

type NewsPageProps = {
  params: Promise<{ countryCode: string }>
  searchParams?: Promise<{ page?: string | string[] }>
}

export default async function NewsPage(props: NewsPageProps) {
  const params = await props.params
  const searchParams = (await props.searchParams) || {}
  const pageParam = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page
  const page = pageParam ? Math.max(1, Number(pageParam) || 1) : 1

  const { posts, pagination } = await listPosts({ page, category: "News" })

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground-primary mb-8">
          News
        </h1>

        {posts.length === 0 ? (
          <p className="text-foreground-secondary">No news articles available.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="border-b border-border-primary pb-6 last:border-b-0"
              >
                <Link
                  href={`/${params.countryCode}/news/${post.slug}`}
                  className="group block"
                >
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground-primary group-hover:text-primary-500 transition-colors mb-2">
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-foreground-muted">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.publishedAt ?? undefined}>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "No date"}
                    </time>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pageCount > 1 && (
          <div className="flex justify-center gap-4 mt-12">
            {pagination.page > 1 && (
              <Link
                href={`/${params.countryCode}/news?page=${pagination.page - 1}`}
                className="px-4 py-2 rounded-full border border-border-primary hover:bg-background-secondary transition-colors"
              >
                Previous
              </Link>
            )}
            <span className="px-4 py-2 text-foreground-secondary">
              Page {pagination.page} of {pagination.pageCount}
            </span>
            {pagination.page < pagination.pageCount && (
              <Link
                href={`/${params.countryCode}/news?page=${pagination.page + 1}`}
                className="px-4 py-2 rounded-full border border-border-primary hover:bg-background-secondary transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
