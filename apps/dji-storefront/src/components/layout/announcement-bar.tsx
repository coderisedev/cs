import { listPosts } from "@/lib/data/blog"
import { AnnouncementBarClient } from "./announcement-bar-client"

export async function AnnouncementBar({ countryCode }: { countryCode: string }) {
  const { posts } = await listPosts({ page: 1, pageSize: 1, category: "header" })
  const post = posts[0] ?? null
  return <AnnouncementBarClient post={post} countryCode={countryCode} />
}
