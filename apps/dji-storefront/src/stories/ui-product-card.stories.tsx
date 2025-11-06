/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from "@storybook/react"
import { ProductCard } from "@/components/products/product-card"
import type { MockProduct } from "@cs/medusa-client"

const mockProduct: MockProduct = {
  id: "1",
  handle: "a320-cdu",
  title: "A320 CDU - Control Display Unit",
  description: "Professional-grade Airbus A320 CDU replica with LED backlighting.",
  price: 499.99,
  compareAtPrice: 599.99,
  images: ["https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800"],
  category: "a320-series",
  variants: [
    { id: "1-1", title: "Standard", price: 499.99, inStock: true },
    { id: "1-2", title: "Pro", price: 599.99, inStock: true },
  ],
  tags: [],
  rating: 4.9,
  reviewCount: 120,
  inStock: true,
  specifications: [],
  compatibility: [],
  features: [],
  collection: "featured",
  isNew: true,
  isSale: true,
}

const meta: Meta<typeof ProductCard> = {
  title: "UI/ProductCard",
  component: ProductCard,
  args: {
    product: mockProduct,
  },
  parameters: {
    layout: "centered",
  },
}

export default meta

type Story = StoryObj<typeof ProductCard>

export const Default: Story = {}
