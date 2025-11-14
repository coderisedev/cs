let cachedKey: string | undefined

export const getMedusaPublishableKey = () => {
  if (cachedKey !== undefined) {
    return cachedKey
  }

  cachedKey =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? process.env.MEDUSA_PUBLISHABLE_KEY ?? ""

  if (!cachedKey && process.env.NODE_ENV !== "production") {
    console.warn("Medusa publishable API key is missing; storefront data fetching may fail.")
  }

  return cachedKey
}
