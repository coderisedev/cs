/**
 * Environment variable validation for Medusa backend
 * Throws error in production if required variables are missing
 */

const requiredEnvVars = [
  "JWT_SECRET",
  "COOKIE_SECRET",
  "DATABASE_URL",
] as const

const optionalEnvVars = [
  "REDIS_URL",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_SECRET",
] as const

/**
 * Validate that all required environment variables are set
 * In production, throws an error if any are missing
 * In development, logs a warning
 */
export function validateEnv(): void {
  const missing: string[] = []

  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  // Check for insecure default values
  if (process.env.JWT_SECRET === "supersecret") {
    missing.push("JWT_SECRET (using insecure default)")
  }
  if (process.env.COOKIE_SECRET === "supersecret") {
    missing.push("COOKIE_SECRET (using insecure default)")
  }

  if (missing.length > 0) {
    const message = `Missing or insecure environment variables: ${missing.join(", ")}`
    if (process.env.NODE_ENV === "production") {
      throw new Error(message)
    } else {
      console.warn(`[env] Warning: ${message}`)
    }
  }
}

/**
 * Get a required environment variable
 * Throws in production if not set, returns fallback in development
 */
export function getRequiredEnv(key: string, devFallback?: string): string {
  const value = process.env[key]

  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Required environment variable ${key} is not set`)
    }
    if (devFallback !== undefined) {
      console.warn(`[env] Using development fallback for ${key}`)
      return devFallback
    }
    throw new Error(`Required environment variable ${key} is not set`)
  }

  return value
}

/**
 * Get JWT secret - throws if not set or using default in production
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET

  if (!secret || secret === "supersecret") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be set to a secure value in production")
    }
    console.warn("[env] Warning: Using insecure JWT_SECRET for development")
    return "supersecret"
  }

  return secret
}

/**
 * Get Cookie secret - throws if not set or using default in production
 */
export function getCookieSecret(): string {
  const secret = process.env.COOKIE_SECRET

  if (!secret || secret === "supersecret") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("COOKIE_SECRET must be set to a secure value in production")
    }
    console.warn("[env] Warning: Using insecure COOKIE_SECRET for development")
    return "supersecret"
  }

  return secret
}

/**
 * Get Redis URL with fallback for development
 */
export function getRedisUrl(): string {
  return process.env.REDIS_URL ?? "redis://127.0.0.1:6379"
}
