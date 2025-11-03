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
