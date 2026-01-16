"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { getRegionConfig, isCountrySupported, SUPPORTED_COUNTRIES } from "@/lib/config/regions"
import { updateCartRegion } from "@/lib/data/cart"

/**
 * Switch the user's country/region
 * Updates the country preference cookie and cart region
 * @param newCountryCode - The new country code to switch to
 * @returns Object with success status and new region config
 */
export async function switchCountry(newCountryCode: string) {
  const normalizedCountry = newCountryCode.toLowerCase()

  if (!isCountrySupported(normalizedCountry)) {
    return {
      success: false,
      error: `Country "${newCountryCode}" is not supported. Supported countries: ${SUPPORTED_COUNTRIES.join(', ')}`,
    }
  }

  const regionConfig = getRegionConfig(normalizedCountry)
  const cookieStore = await cookies()

  // Update country preference cookie
  cookieStore.set('_medusa_country_code', normalizedCountry, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    sameSite: 'lax',
  })

  // Update cart region if cart exists
  try {
    await updateCartRegion(normalizedCountry)
  } catch (error) {
    console.error('Failed to update cart region:', error)
    // Continue even if cart update fails - cart will be updated on next add-to-cart
  }

  // Revalidate all paths to reflect new currency/region
  revalidatePath('/', 'layout')

  return {
    success: true,
    country: normalizedCountry,
    region: {
      name: regionConfig.name,
      currency: regionConfig.currency,
    },
  }
}

/**
 * Get the current country from cookie
 * @returns The current country code or 'us' as default
 */
export async function getCurrentCountry(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.get('_medusa_country_code')?.value?.toLowerCase() || 'us'
}
