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
}

export interface ProductVariant {
  id: string
  title: string
  price: number
  size?: string
  color?: string
  inStock: boolean
}

export interface CartItem {
  id: string
  productId: string
  variantId: string
  title: string
  price: number
  quantity: number
  image: string
  variant: {
    size?: string
    color?: string
  }
}

export interface Review {
  id: string
  productId: string
  author: string
  avatar?: string
  rating: number
  title: string
  content: string
  date: string
  verified: boolean
  helpful: number
}

export interface Address {
  id: string
  name: string
  address: string
  city: string
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
}

export interface Order {
  id: string
  orderNumber: string
  date: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: CartItem[]
  total: number
  shippingAddress: Address
  trackingNumber?: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  addresses: Address[]
  orders: Order[]
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
  parent?: string
  children?: Category[]
}
