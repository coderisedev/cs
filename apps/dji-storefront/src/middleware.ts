import { NextRequest, NextResponse } from "next/server"

const SKIP_REGION_MIDDLEWARE =
  process.env.NEXT_SKIP_REGION_MIDDLEWARE === "true" ||
  process.env.NEXT_PUBLIC_SKIP_REGION_MIDDLEWARE === "true"

// Supported countries per region (must match lib/config/regions.ts)
const US_COUNTRIES = [
  // North America
  'us', 'ca', 'mx',
  // Central America
  'gt', 'hn', 'sv', 'ni', 'cr', 'pa',
  // Caribbean
  'do', 'jm', 'tt', 'bs', 'bb',
  // South America (excluding Brazil)
  'ar', 'cl', 'co', 'pe', 'ec', 've', 'uy', 'py', 'bo',
]
const EU_COUNTRIES = [
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
]
const SUPPORTED_COUNTRIES = [...US_COUNTRIES, ...EU_COUNTRIES]

const DEFAULT_COUNTRY = 'us'

// Map of language/locale codes to country codes
const LANGUAGE_TO_COUNTRY: Record<string, string> = {
  // English variants
  'en-us': 'us',
  'en-ca': 'ca',
  'en-gb': 'gb',
  'en-au': 'au',
  'en-nz': 'nz',
  'en-ie': 'ie',
  'en-sg': 'sg',
  'en-za': 'za',
  'en-hk': 'hk',
  'en-ph': 'ph',
  'en': 'us',
  // German
  'de': 'de',
  'de-de': 'de',
  'de-at': 'at',
  'de-ch': 'ch',
  'de-li': 'li',
  // French
  'fr': 'fr',
  'fr-fr': 'fr',
  'fr-ca': 'ca',
  'fr-ch': 'ch',
  'fr-be': 'be',
  'fr-lu': 'lu',
  'fr-mc': 'mc',
  // Italian
  'it': 'it',
  'it-it': 'it',
  'it-ch': 'ch',
  // Spanish
  'es': 'es',
  'es-es': 'es',
  'es-mx': 'mx',
  'es-ar': 'ar',
  'es-cl': 'cl',
  'es-co': 'co',
  'es-pe': 'pe',
  'es-ec': 'ec',
  'es-ve': 've',
  'es-uy': 'uy',
  'es-py': 'py',
  'es-bo': 'bo',
  'es-gt': 'gt',
  'es-hn': 'hn',
  'es-sv': 'sv',
  'es-ni': 'ni',
  'es-cr': 'cr',
  'es-pa': 'pa',
  'es-do': 'do',
  // Dutch
  'nl': 'nl',
  'nl-nl': 'nl',
  'nl-be': 'be',
  // Portuguese
  'pt': 'pt',
  'pt-pt': 'pt',
  // Scandinavian
  'sv': 'se',
  'sv-se': 'se',
  'da': 'dk',
  'da-dk': 'dk',
  'nb': 'no',
  'no': 'no',
  'nn': 'no',
  'fi': 'fi',
  'fi-fi': 'fi',
  'is': 'is',
  'is-is': 'is',
  // Eastern European
  'pl': 'pl',
  'pl-pl': 'pl',
  'cs': 'cz',
  'cs-cz': 'cz',
  'sk': 'sk',
  'sk-sk': 'sk',
  'hu': 'hu',
  'hu-hu': 'hu',
  'ro': 'ro',
  'ro-ro': 'ro',
  'bg': 'bg',
  'bg-bg': 'bg',
  'hr': 'hr',
  'hr-hr': 'hr',
  'sl': 'si',
  'sl-si': 'si',
  'et': 'ee',
  'et-ee': 'ee',
  'lv': 'lv',
  'lv-lv': 'lv',
  'lt': 'lt',
  'lt-lt': 'lt',
  // Balkans
  'sr': 'rs',
  'sr-rs': 'rs',
  'mk': 'mk',
  'mk-mk': 'mk',
  'sq': 'al',
  'sq-al': 'al',
  'bs': 'ba',
  'bs-ba': 'ba',
  'uk': 'ua',
  'uk-ua': 'ua',
  // Greek
  'el': 'gr',
  'el-gr': 'gr',
  // Middle East
  'ar': 'ae',
  'ar-ae': 'ae',
  'ar-sa': 'sa',
  'ar-qa': 'qa',
  'ar-kw': 'kw',
  'ar-bh': 'bh',
  'ar-om': 'om',
  'ar-jo': 'jo',
  'ar-lb': 'lb',
  'ar-eg': 'eg',
  'ar-ma': 'ma',
  'ar-tn': 'tn',
  'he': 'il',
  'he-il': 'il',
  'tr': 'tr',
  'tr-tr': 'tr',
  // Asia-Pacific
  'ja': 'jp',
  'ja-jp': 'jp',
  'ko': 'kr',
  'ko-kr': 'kr',
  'zh': 'cn',
  'zh-cn': 'cn',
  'zh-hans': 'cn',
  'zh-tw': 'tw',
  'zh-hant': 'tw',
  'zh-hk': 'hk',
  'ms': 'my',
  'ms-my': 'my',
  'th': 'th',
  'th-th': 'th',
  'vi': 'vn',
  'vi-vn': 'vn',
  'id': 'id',
  'id-id': 'id',
  'tl': 'ph',
  'tl-ph': 'ph',
}

/**
 * Parse Accept-Language header and return the best matching country
 */
function getCountryFromAcceptLanguage(acceptLanguage: string | null): string | null {
  if (!acceptLanguage) return null

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,de;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, qValue] = lang.trim().split(';q=')
      return {
        code: code.toLowerCase(),
        q: qValue ? parseFloat(qValue) : 1.0,
      }
    })
    .sort((a, b) => b.q - a.q)

  // Find the first matching country
  for (const { code } of languages) {
    const country = LANGUAGE_TO_COUNTRY[code]
    if (country && SUPPORTED_COUNTRIES.includes(country)) {
      return country
    }
    // Try just the language part (e.g., 'en' from 'en-US')
    const langOnly = code.split('-')[0]
    const countryFromLang = LANGUAGE_TO_COUNTRY[langOnly]
    if (countryFromLang && SUPPORTED_COUNTRIES.includes(countryFromLang)) {
      return countryFromLang
    }
  }

  return null
}

/**
 * Get country from IP geolocation headers
 * Returns null if no valid IP-based country detected
 */
function getCountryFromIP(request: NextRequest): string | null {
  // Vercel IP geolocation header (free, zero latency on Vercel)
  const vercelCountry = request.headers.get('x-vercel-ip-country')?.toLowerCase()
  if (vercelCountry && SUPPORTED_COUNTRIES.includes(vercelCountry)) {
    return vercelCountry
  }

  // Cloudflare header (if using Cloudflare)
  const cfCountry = request.headers.get('cf-ipcountry')?.toLowerCase()
  if (cfCountry && SUPPORTED_COUNTRIES.includes(cfCountry)) {
    return cfCountry
  }

  return null
}

/**
 * Detect country from request
 *
 * Priority (IP-first strategy):
 * 1. Session cookie (user's manual selection for current browser session)
 * 2. IP geolocation (Vercel/Cloudflare headers) - PRIMARY for new sessions
 * 3. Accept-Language header (fallback for local dev)
 * 4. Default to US
 *
 * This ensures:
 * - New visits always use IP-based detection
 * - User can override for current session by selecting a country
 * - Next visit (new session) returns to IP-based detection
 */
function getCountryFromRequest(request: NextRequest): string {
  // 1. Check session cookie (user's manual selection for THIS session only)
  // This cookie has no maxAge, so it expires when browser closes
  const sessionCountry = request.cookies.get('_medusa_session_country')?.value?.toLowerCase()
  if (sessionCountry && SUPPORTED_COUNTRIES.includes(sessionCountry)) {
    return sessionCountry
  }

  // 2. IP geolocation - PRIMARY method for automatic detection
  const ipCountry = getCountryFromIP(request)
  if (ipCountry) {
    return ipCountry
  }

  // 3. Accept-Language header fallback (useful for local dev without IP headers)
  const acceptLanguage = request.headers.get('accept-language')
  const langCountry = getCountryFromAcceptLanguage(acceptLanguage)
  if (langCountry) {
    return langCountry
  }

  // 4. Default to US
  return DEFAULT_COUNTRY
}

/**
 * Multi-region middleware with IP geolocation
 * - Detects user's country from IP or cookie preference
 * - Routes to appropriate country path (/us, /de, /fr, etc.)
 * - Sets country preference cookie for returning visitors
 */
export async function middleware(request: NextRequest) {
  if (SKIP_REGION_MIDDLEWARE) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Skip static assets
  if (pathname.includes(".")) {
    return NextResponse.next()
  }

  // Allow auth popup routes without country prefix
  if (pathname === "/auth" || pathname.startsWith("/auth/")) {
    return NextResponse.next()
  }

  // Check if path already has a country code prefix
  const countryCodePattern = /^\/([a-z]{2})(\/|$)/i
  const match = pathname.match(countryCodePattern)

  if (match) {
    const pathCountry = match[1].toLowerCase()

    // Valid supported country - allow through
    if (SUPPORTED_COUNTRIES.includes(pathCountry)) {
      // Create request headers with pathname for server components to read
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-pathname', pathname)

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })

      // Set cache ID cookie if not present
      if (!request.cookies.get("_medusa_cache_id")) {
        response.cookies.set("_medusa_cache_id", crypto.randomUUID(), {
          maxAge: 60 * 60 * 24, // 1 day
          path: "/",
        })
      }

      // Note: We do NOT set a persistent country cookie here.
      // Country detection is IP-based by default.
      // Only manual user selection sets a session cookie (via switchCountry action).

      return response
    }

    // Unsupported country code in URL - redirect to detected country
    const detectedCountry = getCountryFromRequest(request)
    const newPathname = pathname.replace(countryCodePattern, `/${detectedCountry}$2`)
    const url = request.nextUrl.clone()
    url.pathname = newPathname
    return NextResponse.redirect(url, 307) // Temporary redirect for unsupported countries
  }

  // No country code in path - redirect to detected country
  const detectedCountry = getCountryFromRequest(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${detectedCountry}${pathname === "/" ? "" : pathname}`

  // Use 307 (Temporary Redirect) so each visit re-evaluates IP
  // No persistent cookie is set - IP detection happens fresh on each new session
  return NextResponse.redirect(url, 307)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
