"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Bell, Calendar } from "lucide-react"
import Link from "next/link"
import type { BlogPost } from "@/lib/data/blog"

type LatestNewsClientProps = {
  post: BlogPost | null
  countryCode: string
}

export function LatestNewsClient({ post, countryCode }: LatestNewsClientProps) {
  if (!post) {
    return null
  }

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <section className="w-full bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-8 md:gap-12">
          {/* Left Content */}
          <div className="flex-1 space-y-3 sm:space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs sm:text-sm font-medium">
              <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Latest News</span>
            </div>

            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              {post.title}
            </h2>

            {formattedDate && (
              <div className="flex items-center justify-center md:justify-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>

          {/* Right Action */}
          <div className="flex-shrink-0 w-full md:w-auto">
            <Link href={`/${countryCode}/news/${post.slug}`}>
              <Button
                size="lg"
                className="w-full md:w-auto rounded-full px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 bg-brand-blue-500 text-white hover:bg-brand-blue-600 border-none"
              >
                Read More <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
