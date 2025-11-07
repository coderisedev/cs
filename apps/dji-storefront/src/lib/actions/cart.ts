"use server"

import { revalidatePath } from "next/cache"
import { updateLineItem, deleteLineItem } from "@/lib/data/cart"

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
