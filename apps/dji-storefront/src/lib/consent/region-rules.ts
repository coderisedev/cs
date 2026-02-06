/**
 * Region detection rules for GDPR/CCPA compliance
 *
 * GDPR (General Data Protection Regulation):
 * - Applies to EU/EEA countries, UK, and Switzerland
 * - Requires explicit opt-in consent before non-essential cookies
 *
 * CCPA (California Consumer Privacy Act):
 * - Applies to California residents (approximated as US)
 * - Requires opt-out mechanism and "Do Not Sell" notice
 * - Default is opt-in (cookies allowed unless user opts out)
 *
 * Default:
 * - Other regions default to opt-in (cookies allowed)
 */

import type { RegionType, ConsentPreferences } from "./types"

/**
 * GDPR countries - EU/EEA + UK + Switzerland
 * These require explicit opt-in before setting non-essential cookies
 */
const GDPR_COUNTRIES = new Set([
  // EU Member States
  "at", // Austria
  "be", // Belgium
  "bg", // Bulgaria
  "hr", // Croatia
  "cy", // Cyprus
  "cz", // Czech Republic
  "dk", // Denmark
  "ee", // Estonia
  "fi", // Finland
  "fr", // France
  "de", // Germany
  "gr", // Greece
  "hu", // Hungary
  "ie", // Ireland
  "it", // Italy
  "lv", // Latvia
  "lt", // Lithuania
  "lu", // Luxembourg
  "mt", // Malta
  "nl", // Netherlands
  "pl", // Poland
  "pt", // Portugal
  "ro", // Romania
  "sk", // Slovakia
  "si", // Slovenia
  "es", // Spain
  "se", // Sweden

  // EEA (non-EU)
  "is", // Iceland
  "li", // Liechtenstein
  "no", // Norway

  // Other GDPR-equivalent jurisdictions
  "gb", // United Kingdom (UK GDPR)
  "ch", // Switzerland (similar framework)
])

/**
 * CCPA states/countries - currently approximated as US
 * CCPA specifically applies to California, but we apply US-wide
 * for simplicity. Requires opt-out mechanism.
 */
const CCPA_COUNTRIES = new Set([
  "us", // United States
])

/**
 * Detect region type from country code
 * @param countryCode - ISO 3166-1 alpha-2 country code (lowercase)
 */
export function getRegionType(countryCode: string): RegionType {
  const normalized = countryCode.toLowerCase()

  if (GDPR_COUNTRIES.has(normalized)) {
    return "gdpr"
  }

  if (CCPA_COUNTRIES.has(normalized)) {
    return "ccpa"
  }

  return "default"
}

/**
 * Get default consent preferences for a region type
 * GDPR: All non-essential OFF by default (opt-in required)
 * CCPA/Default: All ON by default (opt-out model)
 */
export function getDefaultPreferences(regionType: RegionType): ConsentPreferences {
  if (regionType === "gdpr") {
    // GDPR requires explicit opt-in - default to OFF
    return {
      essential: true,
      analytics: false,
      marketing: false,
    }
  }

  // CCPA and other regions - default to ON (opt-out model)
  return {
    essential: true,
    analytics: true,
    marketing: true,
  }
}

/**
 * Check if a region requires explicit opt-in consent
 */
export function requiresExplicitConsent(regionType: RegionType): boolean {
  return regionType === "gdpr"
}

/**
 * Check if a region requires "Do Not Sell" notice (CCPA)
 */
export function requiresDoNotSellNotice(regionType: RegionType): boolean {
  return regionType === "ccpa"
}

/**
 * Get consent banner behavior for a region
 */
export function getBannerBehavior(regionType: RegionType): {
  showImmediately: boolean
  blockTrackingUntilConsent: boolean
  defaultState: "accept" | "reject"
} {
  if (regionType === "gdpr") {
    return {
      showImmediately: true,
      blockTrackingUntilConsent: true,
      defaultState: "reject",
    }
  }

  // CCPA and default - show banner but allow tracking
  return {
    showImmediately: true,
    blockTrackingUntilConsent: false,
    defaultState: "accept",
  }
}
