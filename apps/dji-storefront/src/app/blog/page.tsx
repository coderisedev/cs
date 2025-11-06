import { getBlogPosts, getBlogCategories } from "@/lib/data/blog"
import { BlogPageClient } from "./blog-client"

export const metadata = {
  title: "Blog · DJI Storefront",
  description: "Insights, tutorials, and reviews for flight-sim builders",
}

const posts = getBlogPosts()
const categories = getBlogCategories()

export default function BlogPage() {
  return <BlogPageClient posts={posts} categories={categories} />
}
