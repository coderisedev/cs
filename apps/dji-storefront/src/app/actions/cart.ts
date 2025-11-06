"use server"

import { addToCart } from "@/lib/data/cart"

export async function addToCartAction({ variantId, quantity, countryCode }: { variantId: string; quantity: number; countryCode: string }) {
  await addToCart({ variantId, quantity, countryCode })
}
