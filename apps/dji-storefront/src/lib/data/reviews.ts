export type Review = {
  id: string
  productId: string
  author: string
  rating: number
  title: string
  content: string
  date: string
  verified: boolean
  helpful: number
}

const reviews: Review[] = [
  {
    id: "r1",
    productId: "1",
    author: "John Smith",
    rating: 5,
    title: "Exceptional Quality and Realism",
    content:
      "The A320 CDU is absolutely stunning. The build quality is exceptional, and the integration with MSFS 2024 is flawless. Every button has a satisfying click, and the backlit display adds to the immersion.",
    date: "2025-10-15",
    verified: true,
    helpful: 87,
  },
  {
    id: "r2",
    productId: "1",
    author: "Mike Johnson",
    rating: 5,
    title: "Worth Every Penny",
    content: "As a real-world A320 pilot, I can confirm this CDU is incredibly accurate. Perfect for practicing procedures at home.",
    date: "2025-10-20",
    verified: true,
    helpful: 124,
  },
  {
    id: "r3",
    productId: "2",
    author: "Sarah Williams",
    rating: 5,
    title: "Professional Grade Equipment",
    content:
      "The 737 MCP exceeded my expectations. The rotary encoders are smooth and precise. Installation was straightforward, and it works perfectly with PMDG 737.",
    date: "2025-10-18",
    verified: true,
    helpful: 93,
  },
]

export const getReviewsByProduct = (productId: string) => reviews.filter((review) => review.productId === productId)
