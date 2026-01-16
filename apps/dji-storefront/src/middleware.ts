import { NextRequest, NextResponse } from "next/server"

const SKIP_REGION_MIDDLEWARE =
  process.env.NEXT_SKIP_REGION_MIDDLEWARE === "true" ||
  process.env.NEXT_PUBLIC_SKIP_REGION_MIDDLEWARE === "true"

// Supported countries per region (must match lib/config/regions.ts)
const US_COUNTRIES = ['us', 'ca']
const EU_COUNTRIES = [
  'de', 'fr', 'it', 'es', 'nl', 'se', 'dk', 'fi', 'no',
  'ch', 'pt', 'pl', 'gr', 'ie', 'hu', 'lu', 'is', 'lt', 'mc',
]
const SUPPORTED_COUNTRIES = [...US_COUNTRIES, ...EU_COUNTRIES]

const DEFAULT_COUNTRY = 'us'

/**
 * Detect country from request headers or cookies
 * Priority: 1. User preference cookie, 2. Vercel geolocation, 3. Cloudflare header, 4. Default
 */
function getCountryFromRequest(request: NextRequest): string {
  // 1. Check user preference cookie (previous selection)
  const countryCookie = request.cookies.get('_medusa_country_code')?.value?.toLowerCase()
  if (countryCookie && SUPPORTED_COUNTRIES.includes(countryCookie)) {
    return countryCookie
  }

  // 2. Vercel IP geolocation header (free, zero latency on Vercel)
  const vercelCountry = request.headers.get('x-vercel-ip-country')?.toLowerCase()
  if (vercelCountry && SUPPORTED_COUNTRIES.includes(vercelCountry)) {
    return vercelCountry
  }

  // 3. Cloudflare header (if using Cloudflare)
  const cfCountry = request.headers.get('cf-ipcountry')?.toLowerCase()
  if (cfCountry && SUPPORTED_COUNTRIES.includes(cfCountry)) {
    return cfCountry
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
      const response = NextResponse.next()

      // Set cache ID cookie if not present
      if (!request.cookies.get("_medusa_cache_id")) {
        response.cookies.set("_medusa_cache_id", crypto.randomUUID(), {
          maxAge: 60 * 60 * 24, // 1 day
          path: "/",
        })
      }

      // Set country preference cookie if not present (first visit to this country)
      if (!request.cookies.get("_medusa_country_code")) {
        response.cookies.set("_medusa_country_code", pathCountry, {
          maxAge: 60 * 60 * 24 * 365, // 1 year
          path: "/",
        })
      }

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

  const response = NextResponse.redirect(url, 307) // Temporary redirect

  // Set country preference cookie
  response.cookies.set("_medusa_country_code", detectedCountry, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  })

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
