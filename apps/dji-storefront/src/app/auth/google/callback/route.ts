import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { revalidateTag } from "next/cache"
import { MEDUSA_BACKEND_URL } from "@/lib/medusa"
import { getCacheTag } from "@/lib/server/cookies"
import { transferCart } from "@/lib/actions/auth"
import { buildDefaultAccountPath, sanitizeRedirectPath } from "@/lib/util/redirect"

const DEFAULT_REDIRECT = buildDefaultAccountPath()

type PopupPayload =
  | { source: "google-oauth-popup"; success: true; redirectUrl: string }
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
            window.opener.postMessage(message, window.location.origin);
          }
          window.close();
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
    cookieStore.delete({ name: cookieName, path: "/" })
    return sanitizeRedirectPath(decodeURIComponent(stored), DEFAULT_REDIRECT)
  }

  return DEFAULT_REDIRECT
}

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state")
  const returnTo = await getReturnRedirect(state)
  const callbackUrl = new URL(`/auth/customer/google/callback${request.nextUrl.search}`, MEDUSA_BACKEND_URL)

  try {
    const medusaResponse = await fetch(callbackUrl, {
      method: "GET",
      cache: "no-store",
    })

    const payload = await medusaResponse.json().catch(() => ({}))

    if (medusaResponse.ok && typeof payload?.token === "string") {
      const token = payload.token
      const customerCacheTag = await getCacheTag("customers")
      if (customerCacheTag) {
        revalidateTag(customerCacheTag)
      }

      await transferCart(token)

      const response = buildPopupResponse({
        source: "google-oauth-popup",
        success: true,
        redirectUrl: returnTo,
      })

      response.cookies.set("_medusa_jwt", token, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      })

      return response
    }

    const errorMessage =
      payload?.error || payload?.message || `Medusa rejected OAuth callback (${medusaResponse.status})`

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
