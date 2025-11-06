export type BlogCategory = {
  id: string
  name: string
  slug: string
  description: string
  postCount: number
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  authorAvatar: string
  publishDate: string
  readTime: number
  category: string
  tags: string[]
  featuredImage: string
  isPublished: boolean
}

const categories: BlogCategory[] = [
  { id: "1", name: "Flight Simulation", slug: "flight-simulation", description: "Latest trends and insights", postCount: 12 },
  { id: "2", name: "Product Reviews", slug: "product-reviews", description: "In-depth hardware reviews", postCount: 8 },
  { id: "3", name: "Tutorials", slug: "tutorials", description: "Step-by-step cockpit guides", postCount: 15 },
  { id: "4", name: "Industry News", slug: "industry-news", description: "News from aviation", postCount: 6 },
  { id: "5", name: "Technology", slug: "technology", description: "Cutting-edge tooling", postCount: 9 },
]

const posts: BlogPost[] = [
  {
    id: "1",
    title: "The Evolution of Flight Simulation Technology",
    slug: "evolution-flight-simulation-technology",
    excerpt:
      "How flight simulation transformed from simple programs to ultra-realistic training tools that match DJI's standard.",
    content:
      "Flight simulation has advanced rapidly thanks to GPU rendering, motion platforms, and the software ecosystems that surround MSFS 2024. This article breaks down the milestones and how home cockpit builders can take advantage of the same techniques.",
    author: "Sarah Johnson",
    authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    publishDate: "2024-10-28",
    readTime: 8,
    category: "flight-simulation",
    tags: ["technology", "innovation", "simulation"],
    featuredImage: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=400&fit=crop",
    isPublished: true,
  },
  {
    id: "2",
    title: "A320 CDU vs Traditional Instruments: A Comprehensive Comparison",
    slug: "a320-cdu-vs-traditional-instruments",
    excerpt:
      "Detailed look at how the A320 CDU replicates real-world avionics and what sim pilots gain over legacy panels.",
    content:
      "The Airbus A320 CDU offers automation and data handling that analog instruments simply cannot match. We cover the tactile experience, configuration steps, and software pairings that make the CDU shine inside a DJI-aligned cockpit.",
    author: "Michael Chen",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    publishDate: "2024-10-25",
    readTime: 12,
    category: "product-reviews",
    tags: ["a320", "cdu", "comparison"],
    featuredImage: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=400&fit=crop",
    isPublished: true,
  },
  {
    id: "3",
    title: "Building Your First Home Cockpit Simulator",
    slug: "building-first-home-cockpit-simulator",
    excerpt: "Complete guide to selecting hardware, mounting panels, and wiring controls the DJI way.",
    content:
      "From choosing the airframe to mounting FCU/CDU stacks, we outline every step including recommended spacing, cable management, and software profiles.",
    author: "David Rodriguez",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    publishDate: "2024-10-22",
    readTime: 15,
    category: "tutorials",
    tags: ["tutorial", "beginner", "setup"],
    featuredImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
    isPublished: true,
  },
]

export const getBlogPosts = () => posts
export const getBlogCategories = () => categories
export const getBlogPost = (slug: string) => posts.find((post) => post.slug === slug)
