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
  views: number
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
      "Explore how flight simulation has transformed from simple computer programs to incredibly realistic experiences that rival actual flight training.",
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
    views: 1250,
  },
  {
    id: "2",
    title: "A320 CDU vs Traditional Instruments: A Comprehensive Comparison",
    slug: "a320-cdu-vs-traditional-instruments",
    excerpt:
      "Detailed analysis of how the A320 Control Display Unit compares to traditional flight instruments in terms of functionality and user experience.",
    content:
      "The Airbus A320 CDU offers automation and data handling that analog instruments simply cannot match. We cover the tactile experience, configuration steps, and software pairings that make the CDU shine inside a DJI-aligned cockpit.",
    author: "Michael Chen",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    publishDate: "2024-10-25",
    readTime: 12,
    category: "product-reviews",
    tags: ["a320", "cdu", "comparison", "instruments"],
    featuredImage: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=400&fit=crop",
    isPublished: true,
    views: 890,
  },
  {
    id: "3",
    title: "Building Your First Home Cockpit Simulator",
    slug: "building-first-home-cockpit-simulator",
    excerpt: "A complete guide to setting up your first home cockpit simulator, from hardware selection to software configuration.",
    content:
      "From choosing the airframe to mounting FCU/CDU stacks, we outline every step including recommended spacing, cable management, and software profiles.",
    author: "David Rodriguez",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    publishDate: "2024-10-22",
    readTime: 15,
    category: "tutorials",
    tags: ["tutorial", "beginner", "setup", "hardware"],
    featuredImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
    isPublished: true,
    views: 2100,
  },
  {
    id: "4",
    title: "The Future of Virtual Reality in Flight Training",
    slug: "future-vr-flight-training",
    excerpt: "How VR technology is revolutionizing flight training programs and making pilot education more accessible and effective.",
    content:
      "Virtual reality is redefining flight training. We examine hardware requirements, common pitfalls, and how CS Bridge integrates with VR-specific plugins.",
    author: "Emily Watson",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    publishDate: "2024-10-20",
    readTime: 10,
    category: "technology",
    tags: ["vr", "training", "future", "technology"],
    featuredImage: "https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=800&h=400&fit=crop",
    isPublished: true,
    views: 1567,
  },
  {
    id: "5",
    title: "Boeing 737 Series: Most Popular Cockpit Simulator Platform",
    slug: "boeing-737-most-popular-simulator",
    excerpt: "Understanding why the Boeing 737 series remains the most popular choice for cockpit simulator enthusiasts worldwide.",
    content:
      "We look at adoption statistics, plugin availability, and training resources that keep the 737 series at the top of home cockpit builds.",
    author: "Robert Kim",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    publishDate: "2024-10-18",
    readTime: 7,
    category: "industry-news",
    tags: ["737", "popular", "platform", "statistics"],
    featuredImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=400&fit=crop",
    isPublished: true,
    views: 980,
  },
  {
    id: "6",
    title: "Advanced FCU Programming Techniques",
    slug: "advanced-fcu-programming-techniques",
    excerpt: "Master advanced programming techniques for Flight Control Units to create more realistic and functional simulator experiences.",
    content:
      "Power users can extend CS Bridge with custom scripts. We cover the FCU APIs, debugging tips, and recommended workflows.",
    author: "Lisa Park",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    publishDate: "2024-10-15",
    readTime: 18,
    category: "tutorials",
    tags: ["fcu", "programming", "advanced", "techniques"],
    featuredImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop",
    isPublished: true,
    views: 743,
  },
]

export const getBlogPosts = () => posts
export const getBlogCategories = () => categories
export const getBlogPost = (slug: string) => posts.find((post) => post.slug === slug)
