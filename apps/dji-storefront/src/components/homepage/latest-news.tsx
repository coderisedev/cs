import { listPosts } from "@/lib/data/blog"
import { LatestNewsClient } from "./latest-news-client"

export async function LatestNews({ countryCode }: { countryCode: string }) {
  const { posts } = await listPosts({ page: 1, pageSize: 1, category: "News" })
  const latestPost = posts[0] ?? null

  return <LatestNewsClient post={latestPost} countryCode={countryCode} />
}
