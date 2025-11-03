import { Metadata } from "next"
import { getAllPostSummaries, getAllCategories } from "@/lib/blog/utils"
import BlogListTemplate from "@/modules/blog/templates/blog-list"

export const metadata: Metadata = {
  title: "Blog | CockpitSim",
  description:
    "Explore articles, tutorials, and insights about flight simulation technology, hardware reviews, and expert tips from the CockpitSim community.",
}

export default function BlogPage() {
  const posts = getAllPostSummaries()
  const categories = getAllCategories()

  return <BlogListTemplate posts={posts} categories={categories} />
}
