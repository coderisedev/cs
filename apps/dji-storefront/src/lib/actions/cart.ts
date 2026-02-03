"use server"

import { revalidatePath } from "next/cache"
import { updateLineItem, deleteLineItem, applyPromoCode, removePromoCode } from "@/lib/data/cart"

export async function updateLineItemAction({ lineId, quantity }: { lineId: string; quantity: number }) {
  try {
    await updateLineItem({ lineId, quantity })
    revalidatePath("/[countryCode]/cart")
  } catch (error) {
    console.error("Error updating line item:", error)
    throw error
  }
}

export async function deleteLineItemAction(lineId: string) {
  try {
    await deleteLineItem(lineId)
    revalidatePath("/[countryCode]/cart")
  } catch (error) {
    console.error("Error deleting line item:", error)
    throw error
  }
}

export async function applyPromoCodeAction(promoCode: string): Promise<{ success: boolean; error?: string }> {
  try {
    await applyPromoCode(promoCode)
    revalidatePath("/[countryCode]/cart", "page")
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid promo code"
    return { success: false, error: message }
  }
}

export async function removePromoCodeAction(promoCode: string): Promise<{ success: boolean; error?: string }> {
  try {
    await removePromoCode(promoCode)
    revalidatePath("/[countryCode]/cart", "page")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to remove promo code" }
  }
}
