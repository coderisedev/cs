import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { revalidateTag } from "next/cache"
import { MEDUSA_BACKEND_URL, sdk } from "@/lib/medusa"
import { setAuthToken, getCacheTag } from "@/lib/server/cookies"
import { transferCart } from "@/lib/actions/auth"
import { buildDefaultAccountPath, sanitizeRedirectPath } from "@/lib/util/redirect"
import { getMedusaPublishableKey } from "@/lib/publishable-key"

const DEFAULT_REDIRECT = buildDefaultAccountPath()

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

type PopupPayload =
  | { source: "google-oauth-popup"; success: true; redirectUrl: string; token?: string }
  | { source: "google-oauth-popup"; success: false; error: string }

type OAuthCallbackQuery = Record<string, string>

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
  try {
    const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries()) as OAuthCallbackQuery
    const tokenCandidate = (await sdk.auth.callback("customer", "google", queryParams)) as unknown as string

    if (typeof tokenCandidate === "string" && tokenCandidate) {
      console.log(`[auth] google callback exchanged token via sdk at`, new Date().toISOString())
      const token = tokenCandidate as string
      await setAuthToken(token)
      const customerCacheTag = await getCacheTag("customers")
      if (customerCacheTag) {
        revalidateTag(customerCacheTag)
      }

      await transferCart(token)

      // Verify customer availability; if missing, attempt lightweight bootstrap
      try {
        const pk = getMedusaPublishableKey()
        const headers: Record<string, string> = {
          authorization: `Bearer ${token}`,
        }
        if (pk) headers["x-publishable-api-key"] = pk

        const meRes = await fetch(new URL(`/store/customers/me`, MEDUSA_BACKEND_URL), {
          method: "GET",
          headers,
          cache: "no-store",
        })

        if (meRes.status === 401) {
          // Try to decode email from JWT to create a minimal customer profile
          const parts = token.split(".")
          if (parts.length === 3) {
            try {
              const json = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"))
              const email = (json.email || json.mail || json.upn || json.preferred_username || "").toString()
              if (email) {
                await fetch(new URL(`/store/customers`, MEDUSA_BACKEND_URL), {
                  method: "POST",
                  headers: { ...headers, "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                }).catch((creationError) => {
                  console.warn("Failed to bootstrap Medusa customer via Google fallback", creationError)
                })
              }
            } catch (decodeError) {
              console.warn("Failed to decode Google token payload for Medusa bootstrap", decodeError)
            }
          }
        }
      } catch (verificationError) {
        console.warn("Unable to verify Google-authenticated customer", verificationError)
      }

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

    return buildPopupResponse({
      source: "google-oauth-popup",
      success: false,
      error: "Medusa could not issue a session token",
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
