import Medusa from "@medusajs/js-sdk"
import { getMedusaPublishableKey } from "@/lib/publishable-key"

export const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"

const publishableKey = getMedusaPublishableKey()

if (!publishableKey) {
  console.warn("Missing MEDUSA publishable API key; storefront requests may fail.")
}

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey,
})
