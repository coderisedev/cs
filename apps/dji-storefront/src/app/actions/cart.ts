"use server"

import { revalidatePath } from "next/cache"
import { addToCart } from "@/lib/data/cart"

export async function addToCartAction({ variantId, quantity, countryCode }: { variantId: string; quantity: number; countryCode: string }) {
  await addToCart({ variantId, quantity, countryCode })
  // Revalidate the layout and cart-related pages to update cart count in header
  revalidatePath("/", "layout")
}
