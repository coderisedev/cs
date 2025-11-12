import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { MEDUSA_BACKEND_URL } from "@/lib/medusa"
import { buildDefaultAccountPath, sanitizeRedirectPath } from "@/lib/util/redirect"

const DEFAULT_REDIRECT = buildDefaultAccountPath()

const COOKIE_TTL_SECONDS = 10 * 60

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  const requestedReturn = request.nextUrl.searchParams.get("returnTo")
  const returnTo = sanitizeRedirectPath(requestedReturn, DEFAULT_REDIRECT)

  try {
    const startUrl = new URL("/auth/customer/google", MEDUSA_BACKEND_URL)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    const pk = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (pk) {
      headers["x-publishable-api-key"] = pk
    }

    const medusaResponse = await fetch(startUrl, {
      method: "POST",
      headers,
      cache: "no-store",
    })

    if (!medusaResponse.ok) {
      throw new Error(`Medusa rejected OAuth start (${medusaResponse.status})`)
    }

    const payload = await medusaResponse.json()
    const location = payload?.location

    if (!location || typeof location !== "string") {
      throw new Error("Medusa did not return a redirect location for Google OAuth")
    }

    const target = new URL(location)
    const state = target.searchParams.get("state")

    if (state) {
      const cookieStore = await cookies()
      cookieStore.set(`google_oauth_state_${state}`, encodeURIComponent(returnTo), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: COOKIE_TTL_SECONDS,
        path: "/",
      })
    }

    return NextResponse.redirect(target.toString(), {
      status: 302,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start Google sign-in"
    return new NextResponse(
      `<!doctype html><html><body style="font-family:sans-serif;padding:2rem;">
        <h1>Google sign-in unavailable</h1>
        <p>${message}</p>
        <p>Please close this window and try again later.</p>
      </body></html>`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      }
    )
  }
}
