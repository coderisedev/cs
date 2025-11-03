export interface Product {
  id: string
  handle: string
  title: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: string
  collection?: string
  variants: ProductVariant[]
  tags: string[]
  rating: number
  reviewCount: number
  inStock: boolean
  isNew?: boolean
  isSale?: boolean
  specifications?: Specification[]
  compatibility?: string[]
  features?: string[]
}

export interface ProductVariant {
  id: string
  title: string
  price: number
  color?: string
  size?: string
  inStock: boolean
}

export interface Specification {
  label: string
  value: string
}

export interface Review {
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

export interface Collection {
  id: string
  handle: string
  title: string
  description: string
  image: string
  productCount: number
}

export interface Category {
  id: string
  handle: string
  title: string
  description: string
  image: string
}

export interface CartItem {
  product: Product
  variant: ProductVariant
  quantity: number
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  phone?: string
  dateJoined: string
  preferences: UserPreferences
  addresses: Address[]
}

export interface UserPreferences {
  newsletter: boolean
  notifications: boolean
  language: string
  currency: string
}

export interface Address {
  id: string
  type: 'shipping' | 'billing'
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  isDefault: boolean
}

export interface Order {
  id: string
  orderNumber: string
  date: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  subtotal: number
  shipping: number
  tax: number
  items: OrderItem[]
  shippingAddress: Address
  billingAddress: Address
  trackingNumber?: string
  estimatedDelivery?: string
}

export interface OrderItem {
  id: string
  product: Product
  variant: ProductVariant
  quantity: number
  price: number
}

export interface WishlistItem {
  id: string
  product: Product
  addedDate: string
}

export interface BlogPost {
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

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string
  postCount: number
}
