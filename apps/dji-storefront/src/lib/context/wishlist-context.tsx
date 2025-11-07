"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import type { StorefrontProduct } from "@/lib/data/products"

export type WishlistItem = {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  description?: string | null
  price: number
  addedAt: string
}

export type WishlistInput = {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  description?: string | null
  price: number
}

type WishlistContextValue = {
  items: WishlistItem[]
  addItem: (item: WishlistInput) => void
  removeItem: (id: string) => void
  toggleItem: (item: WishlistInput) => void
  isInWishlist: (id: string) => boolean
}

const STORAGE_KEY = "dji-storefront:wishlist"

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined)

const loadWishlist = (): WishlistItem[] => {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch (error) {
    console.warn("Failed to parse wishlist", error)
  }

  return []
}

const persistWishlist = (items: WishlistItem[]) => {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.warn("Failed to persist wishlist", error)
  }
}

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    setItems(loadWishlist())
  }, [])

  useEffect(() => {
    persistWishlist(items)
  }, [items])

  const addItem = (input: WishlistInput) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === input.id)) {
        return prev
      }

      return [...prev, { ...input, addedAt: new Date().toISOString() }]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const toggleItem = (input: WishlistInput) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === input.id)) {
        return prev.filter((item) => item.id !== input.id)
      }

      return [...prev, { ...input, addedAt: new Date().toISOString() }]
    })
  }

  const isInWishlist = (id: string) => items.some((item) => item.id === id)

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        toggleItem,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider")
  }
  return context
}

export const buildWishlistInput = (
  product: StorefrontProduct,
  priceOverride?: number
): WishlistInput => ({
  id: product.id,
  title: product.title,
  handle: product.handle,
  thumbnail: product.images?.[0] ?? null,
  description: product.description,
  price: priceOverride ?? product.price,
})
