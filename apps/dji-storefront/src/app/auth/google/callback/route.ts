import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { revalidateTag } from "next/cache"
import { MEDUSA_BACKEND_URL, sdk } from "@/lib/medusa"
import { setAuthToken, getCacheTag } from "@/lib/server/cookies"
import { transferCart } from "@/lib/actions/auth"
import { buildDefaultAccountPath, sanitizeRedirectPath } from "@/lib/util/redirect"

const DEFAULT_REDIRECT = buildDefaultAccountPath()

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

type PopupPayload =
  | { source: "google-oauth-popup"; success: true; redirectUrl: string; token?: string }
  | { source: "google-oauth-popup"; success: false; error: string }

const buildPopupResponse = (payload: PopupPayload) => {
  const responseBody = `<!doctype html>
  <html>
    <body style="font-family:sans-serif;padding:2rem;">
      <p>${payload.success ? "Google sign-in successful. You can close this window." : "Google sign-in failed."}</p>
      <script>
        (function() {
          const message = ${JSON.stringify(payload)};
          if (window.opener && !window.opener.closed) {
            try {
              // Send to any origin; the opener validates event.origin.
              window.opener.postMessage(message, "*");
            } catch (err) {
              console.warn('Unable to postMessage to opener', err);
            }
            // Do not navigate the opener here; let the opener handle
            // session persistence first, then navigate.
          }
          setTimeout(() => window.close(), 250);
        })();
      </script>
    </body>
  </html>`

  return new NextResponse(responseBody, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cross-Origin-Opener-Policy": "unsafe-none",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  })
}

const getReturnRedirect = async (state?: string | null) => {
  if (!state) {
    return DEFAULT_REDIRECT
  }

  const cookieStore = await cookies()
  const cookieName = `google_oauth_state_${state}`
  const stored = cookieStore.get(cookieName)?.value

  if (stored) {
    cookieStore.set(cookieName, "", { maxAge: -1, path: "/" })
    return sanitizeRedirectPath(decodeURIComponent(stored), DEFAULT_REDIRECT)
  }

  return DEFAULT_REDIRECT
}

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state")
  const returnTo = await getReturnRedirect(state)
  const callbackUrl = new URL(`/auth/customer/google/callback${request.nextUrl.search}`, MEDUSA_BACKEND_URL)

  try {
    let tokenCandidate: string | undefined
    let lastStatus: number | undefined
    let lastPayload: any
    let sdkError: unknown

    // Preferred: use SDK which automatically attaches publishable key
    try {
      const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries())
      tokenCandidate = (await sdk.auth.callback("customer", "google", queryParams as any)) as unknown as string
    } catch (err) {
      sdkError = err
      // Fallback to direct fetch
      const pk = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      const headers: Record<string, string> = {}
      if (pk) headers["x-publishable-api-key"] = pk
      const medusaResponse = await fetch(callbackUrl, {
        method: "GET",
        headers,
        cache: "no-store",
      })
      lastStatus = medusaResponse.status
      const payload = (await medusaResponse.json().catch(() => ({}))) as any
      lastPayload = payload
      tokenCandidate =
        payload?.token ||
        payload?.access_token ||
        payload?.jwt ||
        payload?.result?.token ||
        payload?.data?.token ||
        payload?.session?.token
    }

    if (typeof tokenCandidate === "string" && tokenCandidate) {
      console.log(`[auth] google callback exchanged token via ${sdkError ? 'fallback' : 'sdk'} at`, new Date().toISOString())
      const token = tokenCandidate as string
      await setAuthToken(token)
      const customerCacheTag = await getCacheTag("customers")
      if (customerCacheTag) {
        revalidateTag(customerCacheTag)
      }

      await transferCart(token)

      const response = buildPopupResponse({
        source: "google-oauth-popup",
        success: true,
        redirectUrl: returnTo,
        token,
      })

      response.cookies.set("_medusa_jwt", token, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      })

      return response
    }

    const errorMessage =
      lastPayload?.error ||
      lastPayload?.message ||
      (lastStatus ? `Medusa rejected OAuth callback (${lastStatus})` : (sdkError instanceof Error ? sdkError.message : "Unable to complete OAuth callback"))

    return buildPopupResponse({
      source: "google-oauth-popup",
      success: false,
      error: errorMessage,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected Google OAuth failure"
    return buildPopupResponse({
      source: "google-oauth-popup",
      success: false,
      error: message,
    })
  }
}
