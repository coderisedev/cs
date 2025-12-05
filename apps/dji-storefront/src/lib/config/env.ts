/**
 * Environment variable validation and configuration
 * This module validates required environment variables at startup
 */

type EnvConfig = {
  // Server-side only
  MEDUSA_BACKEND_URL: string
  STRAPI_API_URL: string
  STRAPI_API_TOKEN: string
  STOREFRONT_BASE_URL: string
  // Client-side (NEXT_PUBLIC_*)
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: string
  NEXT_PUBLIC_DEFAULT_REGION: string
}

const requiredServerEnvVars = [
  "MEDUSA_BACKEND_URL",
  "STRAPI_API_URL",
  "STRAPI_API_TOKEN",
] as const

const requiredClientEnvVars = [
  "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_DEFAULT_REGION",
] as const

function validateEnvVars(): void {
  if (typeof window !== "undefined") {
    // Client-side: only check public vars
    return
  }

  const missing: string[] = []

  for (const key of requiredServerEnvVars) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  for (const key of requiredClientEnvVars) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(", ")}`
    if (process.env.NODE_ENV === "production") {
      throw new Error(message)
    } else {
      console.warn(`[env] Warning: ${message}`)
    }
  }
}

// Run validation on module load (server-side only)
validateEnvVars()

export const env: Partial<EnvConfig> = {
  MEDUSA_BACKEND_URL: process.env.MEDUSA_BACKEND_URL,
  STRAPI_API_URL: process.env.STRAPI_API_URL,
  STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN,
  STOREFRONT_BASE_URL: process.env.STOREFRONT_BASE_URL,
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  NEXT_PUBLIC_DEFAULT_REGION: process.env.NEXT_PUBLIC_DEFAULT_REGION,
}
