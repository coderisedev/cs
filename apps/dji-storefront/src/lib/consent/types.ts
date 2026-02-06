/**
 * Cookie consent types for GDPR/CCPA compliance
 */

/**
 * User consent preferences by category
 */
export type ConsentPreferences = {
  /** Essential cookies - always true, cannot be disabled */
  essential: boolean
  /** Analytics cookies (PostHog) - can be disabled */
  analytics: boolean
  /** Marketing cookies - can be disabled, future-proof */
  marketing: boolean
}

/**
 * Region type based on privacy regulations
 */
export type RegionType = "gdpr" | "ccpa" | "default"

/**
 * Full consent state including metadata
 */
export type ConsentState = {
  /** Whether user has made a consent choice */
  hasConsented: boolean
  /** User's consent preferences */
  preferences: ConsentPreferences
  /** ISO timestamp when consent was given */
  consentTimestamp: string | null
  /** Consent version for future updates */
  consentVersion: string
  /** Detected region type for consent behavior */
  regionType: RegionType
}

/**
 * Consent cookie structure (stored as JSON)
 */
export type ConsentCookie = {
  /** Version of the consent schema */
  v: string
  /** Timestamp when consent was given */
  ts: string
  /** Essential cookies accepted (always true) */
  e: boolean
  /** Analytics cookies accepted */
  a: boolean
  /** Marketing cookies accepted */
  m: boolean
}

/**
 * Cookie category definitions for UI display
 */
export type CookieCategory = {
  id: keyof ConsentPreferences
  name: string
  description: string
  required: boolean
  cookies: string[]
}

/**
 * Default cookie categories with descriptions
 */
export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: "essential",
    name: "Essential",
    description:
      "These cookies are necessary for the website to function and cannot be switched off. They include session management, cart functionality, and authentication.",
    required: true,
    cookies: ["_medusa_jwt", "_medusa_cart_id", "_medusa_cache_id", "_medusa_session_country"],
  },
  {
    id: "analytics",
    name: "Analytics",
    description:
      "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
    required: false,
    cookies: ["ph_*"],
  },
  {
    id: "marketing",
    name: "Marketing",
    description:
      "These cookies are used to deliver advertisements more relevant to you and your interests. They may also be used to limit the number of times you see an advertisement.",
    required: false,
    cookies: [],
  },
]

/** Current consent schema version */
export const CONSENT_VERSION = "1.0"

/** Cookie name for storing consent */
export const CONSENT_COOKIE_NAME = "_cs_consent"
