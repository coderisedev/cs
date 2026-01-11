"use server"

import { revalidatePath } from "next/cache"
import { addToCart } from "@/lib/data/cart"

export async function addToCartAction({ variantId, quantity, countryCode }: { variantId: string; quantity: number; countryCode: string }): Promise<{ success: boolean; error?: string }> {
  try {
    await addToCart({ variantId, quantity, countryCode })
    // Revalidate the layout and cart-related pages to update cart count in header
    revalidatePath("/", "layout")
    return { success: true }
  } catch (error) {
    console.error("Add to cart action failed:", error)
    const message = error instanceof Error ? error.message : "Failed to add item to cart"
    return { success: false, error: message }
  }
}
