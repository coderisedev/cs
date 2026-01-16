/**
 * Multi-region configuration for the storefront
 * Supports Americas (USD) and Europe (EUR) regions
 */

export const REGIONS = {
  us: {
    id: 'reg_01K9KE3SV4Q4J745N8T19YTCMH',
    name: 'Americas',
    currency: 'USD' as const,
    countries: ['us', 'ca'],
  },
  eu: {
    id: 'reg_01K8J5TBMV1EKV404ZG3SZGXEQ',
    name: 'Europe',
    currency: 'EUR' as const,
    countries: [
      'de', 'fr', 'it', 'es', 'nl', 'se', 'dk', 'fi', 'no',
      'ch', 'pt', 'pl', 'gr', 'ie', 'hu', 'lu', 'is', 'lt', 'mc',
    ],
  },
} as const

export type RegionCode = keyof typeof REGIONS
export type CurrencyCode = typeof REGIONS[RegionCode]['currency']

export const COUNTRY_NAMES: Record<string, string> = {
  // Americas
  us: 'United States',
  ca: 'Canada',
  // Europe
  de: 'Germany',
  fr: 'France',
  it: 'Italy',
  es: 'Spain',
  nl: 'Netherlands',
  se: 'Sweden',
  dk: 'Denmark',
  fi: 'Finland',
  no: 'Norway',
  ch: 'Switzerland',
  pt: 'Portugal',
  pl: 'Poland',
  gr: 'Greece',
  ie: 'Ireland',
  hu: 'Hungary',
  lu: 'Luxembourg',
  is: 'Iceland',
  lt: 'Lithuania',
  mc: 'Monaco',
}

// Build country to region mapping
const COUNTRY_TO_REGION: Record<string, RegionCode> = {}
for (const [regionCode, region] of Object.entries(REGIONS)) {
  for (const country of region.countries) {
    COUNTRY_TO_REGION[country] = regionCode as RegionCode
  }
}

export const SUPPORTED_COUNTRIES = Object.keys(COUNTRY_TO_REGION)

/**
 * Get the region code for a given country code
 * @param countryCode - ISO 3166-1 alpha-2 country code (lowercase)
 * @returns Region code ('us' or 'eu'), defaults to 'us' if not found
 */
export function getRegionForCountry(countryCode: string): RegionCode {
  const normalized = countryCode.toLowerCase()
  return COUNTRY_TO_REGION[normalized] || 'us'
}

/**
 * Get the full region configuration for a given country code
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Region configuration object
 */
export function getRegionConfig(countryCode: string) {
  const regionCode = getRegionForCountry(countryCode)
  return REGIONS[regionCode]
}

/**
 * Get the region configuration by region ID
 * @param regionId - Medusa region ID
 * @returns Region configuration object or undefined
 */
export function getRegionConfigById(regionId: string | undefined | null) {
  if (!regionId) return REGIONS.us

  for (const region of Object.values(REGIONS)) {
    if (region.id === regionId) {
      return region
    }
  }
  return REGIONS.us
}

/**
 * Check if a country is supported
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns true if the country is supported
 */
export function isCountrySupported(countryCode: string): boolean {
  return SUPPORTED_COUNTRIES.includes(countryCode.toLowerCase())
}

/**
 * Get the display name for a country code
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Country display name
 */
export function getCountryName(countryCode: string): string {
  return COUNTRY_NAMES[countryCode.toLowerCase()] || countryCode.toUpperCase()
}

/**
 * Check if a country code is in a region's country list
 * This is a type-safe helper to avoid TypeScript issues with readonly arrays
 * @param region - Region configuration object
 * @param countryCode - Country code to check
 * @returns true if the country is in the region
 */
export function isCountryInRegion(
  region: typeof REGIONS[RegionCode],
  countryCode: string
): boolean {
  return (region.countries as readonly string[]).includes(countryCode.toLowerCase())
}

/**
 * Get all countries grouped by region for display
 */
export function getCountriesByRegion() {
  return Object.entries(REGIONS).map(([code, region]) => ({
    code,
    name: region.name,
    currency: region.currency,
    countries: region.countries.map(countryCode => ({
      code: countryCode,
      name: COUNTRY_NAMES[countryCode] || countryCode.toUpperCase(),
    })),
  }))
}
