import { getBlogPosts, getBlogCategories } from "@/lib/data/blog"
import { BlogPageClient } from "./blog-client"

export const metadata = {
  title: "Blog · DJI Storefront",
  description: "Insights, tutorials, and reviews for flight-sim builders",
}

export default function BlogPage() {
  const posts = getBlogPosts()
  const categories = getBlogCategories()
  
  return <BlogPageClient posts={posts} categories={categories} />
}
