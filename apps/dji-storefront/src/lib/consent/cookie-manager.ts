/**
 * Cookie management utilities for consent preferences
 */

import {
  type ConsentCookie,
  type ConsentPreferences,
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
} from "./types"

/** Cookie expiry: 1 year in seconds */
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60

/**
 * Parse consent cookie from string value
 */
export function parseConsentCookie(value: string | null): ConsentPreferences | null {
  if (!value) return null

  try {
    const parsed = JSON.parse(value) as ConsentCookie
    // Validate structure
    if (
      typeof parsed.v !== "string" ||
      typeof parsed.ts !== "string" ||
      typeof parsed.e !== "boolean" ||
      typeof parsed.a !== "boolean" ||
      typeof parsed.m !== "boolean"
    ) {
      return null
    }

    return {
      essential: true, // Always true
      analytics: parsed.a,
      marketing: parsed.m,
    }
  } catch {
    return null
  }
}

/**
 * Serialize consent preferences to cookie value
 */
export function serializeConsentCookie(preferences: ConsentPreferences): string {
  const cookie: ConsentCookie = {
    v: CONSENT_VERSION,
    ts: new Date().toISOString(),
    e: true, // Essential is always true
    a: preferences.analytics,
    m: preferences.marketing,
  }
  return JSON.stringify(cookie)
}

/**
 * Get consent cookie value from document.cookie
 */
export function getConsentCookie(): ConsentPreferences | null {
  if (typeof document === "undefined") return null

  const cookies = document.cookie.split(";")
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=")
    if (name === CONSENT_COOKIE_NAME) {
      return parseConsentCookie(decodeURIComponent(value))
    }
  }
  return null
}

/**
 * Set consent cookie with preferences
 */
export function setConsentCookie(preferences: ConsentPreferences): void {
  if (typeof document === "undefined") return

  const value = serializeConsentCookie(preferences)
  const isSecure = window.location.protocol === "https:"

  // Build cookie string
  const cookieParts = [
    `${CONSENT_COOKIE_NAME}=${encodeURIComponent(value)}`,
    `path=/`,
    `max-age=${COOKIE_MAX_AGE}`,
    `samesite=lax`,
  ]

  // Add Secure flag in production (HTTPS)
  if (isSecure) {
    cookieParts.push("secure")
  }

  document.cookie = cookieParts.join("; ")
}

/**
 * Delete consent cookie (for testing/reset)
 */
export function deleteConsentCookie(): void {
  if (typeof document === "undefined") return

  document.cookie = `${CONSENT_COOKIE_NAME}=; path=/; max-age=0`
}

/**
 * Get consent timestamp from cookie
 */
export function getConsentTimestamp(): string | null {
  if (typeof document === "undefined") return null

  const cookies = document.cookie.split(";")
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=")
    if (name === CONSENT_COOKIE_NAME) {
      try {
        const parsed = JSON.parse(decodeURIComponent(value)) as ConsentCookie
        return parsed.ts
      } catch {
        return null
      }
    }
  }
  return null
}

/**
 * Get consent version from cookie
 */
export function getConsentVersion(): string | null {
  if (typeof document === "undefined") return null

  const cookies = document.cookie.split(";")
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=")
    if (name === CONSENT_COOKIE_NAME) {
      try {
        const parsed = JSON.parse(decodeURIComponent(value)) as ConsentCookie
        return parsed.v
      } catch {
        return null
      }
    }
  }
  return null
}
