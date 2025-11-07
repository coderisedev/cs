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
  } catch (error) {
    console.error("Update customer profile error:", error)
    const message = error instanceof Error ? error.message : "Failed to update profile"
    return { success: false, error: message }
  }
}

type PreferenceActionState = { success: boolean; error: string | null }

export async function updateCustomerPreferences(
  _currentState: PreferenceActionState,
  formData: FormData
): Promise<PreferenceActionState> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!headers.authorization) {
    return { success: false, error: "Please sign in to update preferences." }
  }

  const notifications = formData.get("notifications") === "on"
  const newsletter = formData.get("newsletter") === "on"
  const language = (formData.get("language") as string) || "English (US)"
  const currency = (formData.get("currency") as string) || "USD ($)"

  try {
    const { customer } = await sdk.store.customer.retrieve({}, headers)
    const existingMetadata = customer.metadata ?? {}

    await sdk.store.customer.update(
      {
        metadata: {
          ...existingMetadata,
          preferences: {
            notifications,
            newsletter,
            language,
            currency,
          },
        },
      },
      {},
      headers
    )

    const customerCacheTag = await getCacheTag("customers")
    if (customerCacheTag) {
      revalidateTag(customerCacheTag)
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Update customer preferences error:", error)
    const message = error instanceof Error ? error.message : "Failed to update preferences"
    return { success: false, error: message }
  }
}

type AddressActionState = { success: boolean; error: string | null }

const ADDRESS_SUCCESS: AddressActionState = { success: true, error: null }

const buildAddressPayload = (formData: FormData) => {
  const firstName = (formData.get("first_name") as string)?.trim()
  const lastName = (formData.get("last_name") as string)?.trim()
  const address1 = (formData.get("address_1") as string)?.trim()
  const city = (formData.get("city") as string)?.trim()
  const postalCode = (formData.get("postal_code") as string)?.trim()
  const countryCode = ((formData.get("country_code") as string) || "").toLowerCase()

  if (!firstName || !lastName || !address1 || !city || !postalCode || !countryCode) {
    return {
      error:
        "First name, last name, address, city, postal code, and country are required",
    }
  }

  const payload: HttpTypes.StoreCreateCustomerAddress = {
    first_name: firstName,
    last_name: lastName,
    company: (formData.get("company") as string) || undefined,
    address_1: address1,
    address_2: (formData.get("address_2") as string) || undefined,
    city,
    province: (formData.get("province") as string) || undefined,
    postal_code: postalCode,
    country_code: countryCode,
    phone: (formData.get("phone") as string) || undefined,
  }

  const isDefaultShipping = formData.get("is_default_shipping") === "true"
  const isDefaultBilling = formData.get("is_default_billing") === "true"

  if (isDefaultShipping) {
    payload.is_default_shipping = true
  }

  if (isDefaultBilling) {
    payload.is_default_billing = true
  }

  return { payload }
}

const revalidateAccountTags = async () => {
  const addressesTag = await getCacheTag("account-addresses")
  if (addressesTag) {
    revalidateTag(addressesTag)
  }

  const customersTag = await getCacheTag("customers")
  if (customersTag) {
    revalidateTag(customersTag)
  }
}

export async function addCustomerAddress(
  _currentState: AddressActionState,
  formData: FormData
): Promise<AddressActionState> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!headers.authorization) {
    return { success: false, error: "Please sign in to add an address." }
  }

  const { payload, error } = buildAddressPayload(formData)

  if (error || !payload) {
    return { success: false, error: error ?? "Invalid address payload" }
  }

  try {
    await sdk.store.customer.createAddress(payload, {}, headers)
    await revalidateAccountTags()
    return ADDRESS_SUCCESS
  } catch (error) {
    console.error("Add customer address error:", error)
    const message = error instanceof Error ? error.message : "Failed to add address"
    return { success: false, error: message }
  }
}

export async function updateCustomerAddress(
  _currentState: AddressActionState,
  formData: FormData
): Promise<AddressActionState> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!headers.authorization) {
    return { success: false, error: "Please sign in to update an address." }
  }

  const addressId = (formData.get("address_id") as string) || ""

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const { payload, error } = buildAddressPayload(formData)

  if (error || !payload) {
    return { success: false, error: error ?? "Invalid address payload" }
  }

  const updatePayload: HttpTypes.StoreUpdateCustomerAddress = {
    first_name: payload.first_name,
    last_name: payload.last_name,
    company: payload.company,
    address_1: payload.address_1,
    address_2: payload.address_2,
    city: payload.city,
    province: payload.province,
    postal_code: payload.postal_code,
    country_code: payload.country_code,
    phone: payload.phone,
  }

  try {
    await sdk.store.customer.updateAddress(addressId, updatePayload, {}, headers)
    await revalidateAccountTags()
    return ADDRESS_SUCCESS
  } catch (error) {
    console.error("Update customer address error:", error)
    const message = error instanceof Error ? error.message : "Failed to update address"
    return { success: false, error: message }
  }
}

export async function deleteCustomerAddress(
  _currentState: AddressActionState,
  formData: FormData
): Promise<AddressActionState> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!headers.authorization) {
    return { success: false, error: "Please sign in to delete an address." }
  }

  const addressId = (formData.get("address_id") as string) || ""

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  try {
    await sdk.store.customer.deleteAddress(addressId, headers)
    await revalidateAccountTags()
    return ADDRESS_SUCCESS
  } catch (error) {
    console.error("Delete customer address error:", error)
    const message = error instanceof Error ? error.message : "Failed to delete address"
    return { success: false, error: message }
  }
}
