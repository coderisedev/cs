"use server"

import { sdk } from "@/lib/medusa"
import { getAuthHeaders, getCacheTag } from "@/lib/server/cookies"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"

export async function updateCustomerProfile(
  _currentState: unknown,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string

  if (!firstName || !lastName) {
    return { success: false, error: "First name and last name are required" }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateData: HttpTypes.StoreUpdateCustomer = {
    first_name: firstName,
    last_name: lastName,
    phone: phone || undefined,
  }

  try {
    await sdk.store.customer.update(updateData, {}, headers)

    const customerCacheTag = await getCacheTag("customers")
    if (customerCacheTag) {
      revalidateTag(customerCacheTag)
    }

    return { success: true, error: null }
  } catch (error: any) {
    console.error("Update customer profile error:", error)
    return { success: false, error: error.message || "Failed to update profile" }
  }
}
