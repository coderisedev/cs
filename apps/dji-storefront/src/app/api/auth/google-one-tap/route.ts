import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@/lib/medusa"
import { setAuthToken, getCacheTag } from "@/lib/server/cookies"
import { revalidateTag } from "next/cache"
import { transferCart } from "@/lib/actions/auth"
import { buildDefaultAccountPath, sanitizeRedirectPath } from "@/lib/util/redirect"

const DEFAULT_REDIRECT = buildDefaultAccountPath()

export async function POST(request: NextRequest) {
  try {
    const { credential, returnTo } = await request.json()

    if (!credential || typeof credential !== "string") {
      return NextResponse.json({ success: false, error: "Missing Google credential" }, { status: 400 })
    }

    const result = await sdk.auth.login("customer", "google-one-tap", {
      credential,
    })

    if (!result) {
      throw new Error("Google authentication did not return a token")
    }

    if (typeof result !== "string") {
      if ("location" in result && result.location) {
        return NextResponse.json({ success: false, location: result.location }, { status: 202 })
      }
      throw new Error("Unexpected authentication response")
    }

    await setAuthToken(result)

    const customerCacheTag = await getCacheTag("customers")
    if (customerCacheTag) {
      revalidateTag(customerCacheTag)
    }

    await transferCart()

    return NextResponse.json({
      success: true,
      redirectUrl: sanitizeRedirectPath(returnTo, DEFAULT_REDIRECT),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google login failed"
    console.error("Google One Tap API error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
