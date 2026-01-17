"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { getRegionConfig, isCountrySupported, SUPPORTED_COUNTRIES } from "@/lib/config/regions"
import { updateCartRegion } from "@/lib/data/cart"

/**
 * Switch the user's country/region
 *
 * Sets a SESSION cookie (no maxAge = expires when browser closes)
 * This allows user to override IP detection for the current session,
 * but on next visit (new session), IP detection takes over again.
 *
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

  // Set SESSION cookie (no maxAge = expires when browser closes)
  // This overrides IP detection for the current session only
  // On next visit (new browser session), IP detection will take over again
  cookieStore.set('_medusa_session_country', normalizedCountry, {
    // No maxAge = session cookie (expires when browser closes)
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
 * Get the current country from session cookie
 * Note: This only returns the user's manual selection.
 * For IP-based detection, the middleware handles it.
 * @returns The current country code or 'us' as default
 */
export async function getCurrentCountry(): Promise<string> {
  const cookieStore = await cookies()
  // Check session cookie (user's manual selection)
  return cookieStore.get('_medusa_session_country')?.value?.toLowerCase() || 'us'
}
