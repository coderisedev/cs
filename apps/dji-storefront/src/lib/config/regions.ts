/**
 * Multi-region configuration for the storefront
 * Supports Americas (USD) and Europe/International (EUR) regions
 * EXCLUDED: India (in), Brazil (br), Russia (ru)
 */

export const REGIONS = {
  us: {
    id: 'reg_01K9KE3SV4Q4J745N8T19YTCMH',
    name: 'Americas',
    currency: 'USD' as const,
    countries: [
      // North America
      'us', 'ca', 'mx',
      // Central America
      'gt', 'hn', 'sv', 'ni', 'cr', 'pa',
      // Caribbean
      'do', 'jm', 'tt', 'bs', 'bb',
      // South America (excluding Brazil)
      'ar', 'cl', 'co', 'pe', 'ec', 've', 'uy', 'py', 'bo',
    ],
  },
  eu: {
    id: 'reg_01K8J5TBMV1EKV404ZG3SZGXEQ',
    name: 'International',
    currency: 'EUR' as const,
    countries: [
      // Western Europe
      'de', 'fr', 'it', 'es', 'nl', 'be', 'at', 'ch', 'lu', 'mc', 'li',
      // Northern Europe
      'gb', 'ie', 'se', 'dk', 'fi', 'no', 'is',
      // Southern Europe
      'pt', 'gr', 'mt', 'cy',
      // Central & Eastern Europe
      'pl', 'cz', 'sk', 'hu', 'ro', 'bg', 'hr', 'si', 'ee', 'lv', 'lt',
      // Balkans
      'rs', 'me', 'mk', 'al', 'ba', 'md', 'ua',
      // Middle East
      'ae', 'sa', 'qa', 'kw', 'bh', 'om', 'jo', 'lb', 'il', 'tr', 'eg',
      // Africa
      'za', 'ng', 'ke', 'ma', 'tn', 'gh',
      // Asia-Pacific
      'jp', 'kr', 'au', 'nz', 'sg', 'hk', 'tw', 'my', 'th', 'vn', 'ph', 'id', 'cn',
    ],
  },
} as const

export type RegionCode = keyof typeof REGIONS
export type CurrencyCode = typeof REGIONS[RegionCode]['currency']

export const COUNTRY_NAMES: Record<string, string> = {
  // North America
  us: 'United States',
  ca: 'Canada',
  mx: 'Mexico',
  // Central America
  gt: 'Guatemala',
  hn: 'Honduras',
  sv: 'El Salvador',
  ni: 'Nicaragua',
  cr: 'Costa Rica',
  pa: 'Panama',
  // Caribbean
  do: 'Dominican Republic',
  jm: 'Jamaica',
  tt: 'Trinidad and Tobago',
  bs: 'Bahamas',
  bb: 'Barbados',
  // South America
  ar: 'Argentina',
  cl: 'Chile',
  co: 'Colombia',
  pe: 'Peru',
  ec: 'Ecuador',
  ve: 'Venezuela',
  uy: 'Uruguay',
  py: 'Paraguay',
  bo: 'Bolivia',
  // Western Europe
  de: 'Germany',
  fr: 'France',
  it: 'Italy',
  es: 'Spain',
  nl: 'Netherlands',
  be: 'Belgium',
  at: 'Austria',
  ch: 'Switzerland',
  lu: 'Luxembourg',
  mc: 'Monaco',
  li: 'Liechtenstein',
  // Northern Europe
  gb: 'United Kingdom',
  ie: 'Ireland',
  se: 'Sweden',
  dk: 'Denmark',
  fi: 'Finland',
  no: 'Norway',
  is: 'Iceland',
  // Southern Europe
  pt: 'Portugal',
  gr: 'Greece',
  mt: 'Malta',
  cy: 'Cyprus',
  // Central & Eastern Europe
  pl: 'Poland',
  cz: 'Czech Republic',
  sk: 'Slovakia',
  hu: 'Hungary',
  ro: 'Romania',
  bg: 'Bulgaria',
  hr: 'Croatia',
  si: 'Slovenia',
  ee: 'Estonia',
  lv: 'Latvia',
  lt: 'Lithuania',
  // Balkans
  rs: 'Serbia',
  me: 'Montenegro',
  mk: 'North Macedonia',
  al: 'Albania',
  ba: 'Bosnia and Herzegovina',
  md: 'Moldova',
  ua: 'Ukraine',
  // Middle East
  ae: 'United Arab Emirates',
  sa: 'Saudi Arabia',
  qa: 'Qatar',
  kw: 'Kuwait',
  bh: 'Bahrain',
  om: 'Oman',
  jo: 'Jordan',
  lb: 'Lebanon',
  il: 'Israel',
  tr: 'Turkey',
  eg: 'Egypt',
  // Africa
  za: 'South Africa',
  ng: 'Nigeria',
  ke: 'Kenya',
  ma: 'Morocco',
  tn: 'Tunisia',
  gh: 'Ghana',
  // Asia-Pacific
  jp: 'Japan',
  kr: 'South Korea',
  au: 'Australia',
  nz: 'New Zealand',
  sg: 'Singapore',
  hk: 'Hong Kong',
  tw: 'Taiwan',
  my: 'Malaysia',
  th: 'Thailand',
  vn: 'Vietnam',
  ph: 'Philippines',
  id: 'Indonesia',
  cn: 'China',
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
 * Get flag emoji for a country code
 * Uses Unicode Regional Indicator Symbols to generate flag emojis
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'us', 'de')
 * @returns Flag emoji (e.g., '🇺🇸', '🇩🇪')
 */
export function getCountryFlag(countryCode: string): string {
  const code = countryCode.toUpperCase()
  if (code.length !== 2) return '🏳️'

  // Regional Indicator Symbol offset: 'A' (65) maps to U+1F1E6 (127462)
  const offset = 127397
  const firstChar = code.charCodeAt(0)
  const secondChar = code.charCodeAt(1)

  // Validate characters are A-Z
  if (firstChar < 65 || firstChar > 90 || secondChar < 65 || secondChar > 90) {
    return '🏳️'
  }

  return String.fromCodePoint(firstChar + offset, secondChar + offset)
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
      flag: getCountryFlag(countryCode),
    })),
  }))
}
