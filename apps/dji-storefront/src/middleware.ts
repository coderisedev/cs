import { NextRequest, NextResponse } from "next/server"

const SKIP_REGION_MIDDLEWARE =
  process.env.NEXT_SKIP_REGION_MIDDLEWARE === "true" ||
  process.env.NEXT_PUBLIC_SKIP_REGION_MIDDLEWARE === "true"

// Removed region fetching logic - using fixed US region only

/**
 * Middleware to force all traffic to /us route for global USD site (Plan A)
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

  // Allow auth popup routes (e.g., /auth/google) without forcing /us prefix
  if (pathname === "/auth" || pathname.startsWith("/auth/")) {
    return NextResponse.next()
  }

  // Already on /us path - allow through
  if (pathname === "/us" || pathname.startsWith("/us/")) {
    // Set cache ID cookie if not present
    const cacheIdCookie = request.cookies.get("_medusa_cache_id")
    if (!cacheIdCookie) {
      const response = NextResponse.next()
      response.cookies.set("_medusa_cache_id", crypto.randomUUID(), {
        maxAge: 60 * 60 * 24,
      })
      return response
    }
    return NextResponse.next()
  }

  // Redirect any other country code to /us (e.g., /cn -> /us, /de -> /us)
  const countryCodePattern = /^\/[a-z]{2}(\/|$)/i
  if (countryCodePattern.test(pathname)) {
    const newPathname = pathname.replace(countryCodePattern, "/us$1")
    const url = request.nextUrl.clone()
    url.pathname = newPathname
    return NextResponse.redirect(url, 301)
  }

  // Root or any path without country code - redirect to /us
  const url = request.nextUrl.clone()
  url.pathname = `/us${pathname === "/" ? "" : pathname}`
  return NextResponse.redirect(url, 301)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
