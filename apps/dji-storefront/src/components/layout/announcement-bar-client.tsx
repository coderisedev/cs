"use client"

import Link from "next/link"
import type { BlogPost } from "@/lib/data/blog"

type AnnouncementBarClientProps = {
  post: BlogPost | null
  countryCode: string
}

export function AnnouncementBarClient({ post, countryCode }: AnnouncementBarClientProps) {
  if (!post) {
    return null
  }

  return (
    <div className="w-full bg-primary-500/10 border-b border-primary-500/20">
      <div className="container mx-auto px-4 py-2 text-center">
        <Link
          href={`/${countryCode}/announcement/${post.slug}`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          {post.title}
        </Link>
      </div>
    </div>
  )
}
