import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { revalidateTag } from "next/cache"
import { MEDUSA_BACKEND_URL, sdk } from "@/lib/medusa"
import { setAuthToken, getCacheTag } from "@/lib/server/cookies"
import { transferCart } from "@/lib/actions/auth"
import { buildDefaultAccountPath, sanitizeRedirectPath } from "@/lib/util/redirect"
import { getMedusaPublishableKey } from "@/lib/publishable-key"
import {
  getOAuthProviderConfig,
  getStateCookieName,
  isOAuthProviderEnabled,
  OAuthProviderId,
} from "@/lib/auth/providers"

const DEFAULT_REDIRECT = buildDefaultAccountPath()

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

type RouteParams = { provider: string }
type RouteContext =
  | { params: RouteParams }
  | { params: Promise<RouteParams> }

const getReturnRedirect = async (provider: OAuthProviderId, state?: string | null) => {
  if (!state) {
    return DEFAULT_REDIRECT
  }

  const cookieStore = await cookies()
  const cookieName = getStateCookieName(provider, state)
  const stored = cookieStore.get(cookieName)?.value

  if (stored) {
    cookieStore.set(cookieName, "", { maxAge: -1, path: "/" })
    return sanitizeRedirectPath(decodeURIComponent(stored), DEFAULT_REDIRECT)
  }

  return DEFAULT_REDIRECT
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const resolvedParams = await Promise.resolve(context.params)
  const providerParam = resolvedParams?.provider?.toLowerCase()
  const config = getOAuthProviderConfig(providerParam)

  if (!config || !isOAuthProviderEnabled(config.id)) {
    return NextResponse.json(
      { message: "Unsupported or disabled provider" },
      { status: 404 }
    )
  }

  const state = request.nextUrl.searchParams.get("state")
  const returnTo = await getReturnRedirect(config.id, state)

  try {
    const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries())
    const tokenCandidate = (await sdk.auth.callback(
      "customer",
      config.id,
      queryParams
    )) as unknown as string

    if (typeof tokenCandidate === "string" && tokenCandidate) {
      const token = tokenCandidate as string
      await setAuthToken(token)
      const customerCacheTag = await getCacheTag("customers")
      if (customerCacheTag) {
        revalidateTag(customerCacheTag)
      }

      await transferCart(token)

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
          const parts = token.split(".")
          if (parts.length === 3) {
            try {
              const json = JSON.parse(
                Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
              )
              const email = (
                json.email ||
                json.mail ||
                json.upn ||
                json.preferred_username ||
                ""
              ).toString()
              if (email) {
                await fetch(new URL(`/store/customers`, MEDUSA_BACKEND_URL), {
                  method: "POST",
                  headers: { ...headers, "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                }).catch((creationError) => {
                  console.warn(
                    `Failed to bootstrap Medusa customer via ${config.id} fallback`,
                    creationError
                  )
                })
              }
            } catch (decodeError) {
              console.warn(
                `Failed to decode ${config.id} token payload for Medusa bootstrap`,
                decodeError
              )
            }
          }
        }
      } catch (verificationError) {
        console.warn(`Unable to verify ${config.id}-authenticated customer`, verificationError)
      }

      return NextResponse.redirect(returnTo, {
        status: 302,
      })
    }

    return new NextResponse(
      `<!doctype html><html><body style="font-family:sans-serif;padding:2rem;">
        <h1>${config.label} sign-in failed</h1>
        <p>Medusa could not issue a session token.</p>
        <p>Please return to the storefront and try again.</p>
      </body></html>`,
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    )
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected OAuth failure"
    return new NextResponse(
      `<!doctype html><html><body style="font-family:sans-serif;padding:2rem;">
        <h1>${config.label} sign-in unavailable</h1>
        <p>${message}</p>
        <p>Please return to the storefront and try again later.</p>
      </body></html>`,
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    )
  }
}
