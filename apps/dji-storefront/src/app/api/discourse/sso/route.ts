import { NextRequest, NextResponse } from "next/server"
import { cookies as nextCookies } from "next/headers"
import { sdk } from "@/lib/medusa"
import { getAuthHeaders } from "@/lib/server/cookies"
import { HttpTypes } from "@medusajs/types"
import {
  verifyDiscoursePayload,
  decodePayload,
  buildResponsePayload,
  signPayload,
  isValidReturnUrl,
} from "@/lib/util/discourse-sso"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const SSO_COOKIE_NAME = "_discourse_sso"
const SSO_COOKIE_MAX_AGE = 10 * 60 // 10 minutes (matches Discourse nonce TTL)
const DEFAULT_COUNTRY = "us"

/**
 * GET /api/discourse/sso
 *
 * DiscourseConnect SSO endpoint. Handles the handshake between Discourse and
 * this storefront acting as the Identity Provider.
 *
 * Flow:
 * 1. Discourse redirects user here with ?sso=...&sig=...
 * 2. We verify the signature, then check if user is logged in.
 * 3. If not logged in: stash sso+sig in a cookie and redirect to /login.
 * 4. If logged in: build the response payload and redirect back to Discourse.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  // --- Retrieve SSO parameters (from query or cookie) ---
  let sso = searchParams.get("sso")
  let sig = searchParams.get("sig")

  const cookies = await nextCookies()

  // If arriving from login redirect, parameters may be in the cookie
  if (!sso || !sig) {
    const stored = cookies.get(SSO_COOKIE_NAME)?.value
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        sso = parsed.sso
        sig = parsed.sig
      } catch {
        // ignore malformed cookie
      }
    }
  }

  if (!sso || !sig) {
    return NextResponse.json(
      { error: "Missing sso or sig parameter" },
      { status: 400 }
    )
  }

  // --- Verify HMAC signature ---
  try {
    if (!verifyDiscoursePayload(sso, sig)) {
      return NextResponse.json(
        { error: "Invalid SSO signature" },
        { status: 403 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid SSO signature" },
      { status: 403 }
    )
  }

  // --- Decode payload and validate return URL ---
  let nonce: string
  let returnSsoUrl: string
  try {
    const decoded = decodePayload(sso)
    nonce = decoded.nonce
    returnSsoUrl = decoded.return_sso_url
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid SSO payload"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (!isValidReturnUrl(returnSsoUrl)) {
    return NextResponse.json(
      { error: "Invalid return_sso_url domain" },
      { status: 403 }
    )
  }

  // --- Check if user is logged in ---
  const headers = await getAuthHeaders()
  let customer: HttpTypes.StoreCustomer | null = null

  if (headers.authorization) {
    try {
      const result = await sdk.client.fetch<{
        customer: HttpTypes.StoreCustomer
      }>("/store/customers/me", {
        method: "GET",
        headers,
        cache: "no-store",
      })
      customer = result.customer
    } catch {
      // Token expired or invalid — treat as not logged in
    }
  }

  // --- Not logged in: stash SSO params and redirect to login ---
  if (!customer) {
    const response = NextResponse.redirect(
      new URL(`/${DEFAULT_COUNTRY}/login?returnTo=/api/discourse/sso`, request.url)
    )

    response.cookies.set(SSO_COOKIE_NAME, JSON.stringify({ sso, sig }), {
      maxAge: SSO_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })

    return response
  }

  // --- Logged in: build response and redirect to Discourse ---
  const name = [customer.first_name, customer.last_name]
    .filter(Boolean)
    .join(" ")

  const responsePayload = buildResponsePayload({
    nonce,
    external_id: customer.id,
    email: customer.email ?? "",
    name: name || undefined,
  })

  const responseSig = signPayload(responsePayload)

  const redirectUrl = new URL(returnSsoUrl)
  redirectUrl.searchParams.set("sso", responsePayload)
  redirectUrl.searchParams.set("sig", responseSig)

  const response = NextResponse.redirect(redirectUrl.toString())

  // Clear the SSO cookie
  response.cookies.set(SSO_COOKIE_NAME, "", {
    maxAge: 0,
    path: "/",
  })

  return response
}
