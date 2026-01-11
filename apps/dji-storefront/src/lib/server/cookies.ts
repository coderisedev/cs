"use server"

import "server-only"
import { cookies as nextCookies } from "next/headers"
import { getMedusaPublishableKey } from "@/lib/publishable-key"

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const json = Buffer.from(b64, "base64").toString("utf8")
    return JSON.parse(json)
  } catch {
    return null
  }
}

const resolveCookieDomain = () => {
  // In development mode, don't set cookie domain to allow localhost access
  if (process.env.NODE_ENV === "development") {
    return undefined
  }

  const rawDomain =
    process.env.AUTH_COOKIE_DOMAIN ??
    process.env.STOREFRONT_BASE_URL ??
    process.env.NEXT_PUBLIC_STOREFRONT_BASE_URL

  if (!rawDomain) {
    return undefined
  }

  try {
    const parsed = new URL(rawDomain)
    return parsed.hostname
  } catch {
    return rawDomain.replace(/https?:\/\//, "")
  }
}

const COOKIE_DOMAIN = resolveCookieDomain()
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value
    const pk = getMedusaPublishableKey()

    const headers: Record<string, string> = {}
    if (pk) {
      headers["x-publishable-api-key"] = pk
    }
    if (token) {
      headers["authorization"] = `Bearer ${token}`
      headers["x-medusa-access-token"] = token
      headers["x-medusa-actor-type"] = "customer"
      const claims = decodeJwtPayload(token)
      const actorId = (claims?.["actor_id"] || claims?.["sub"] || claims?.["id"]) as string | undefined
      if (actorId) {
        headers["x-medusa-actor-id"] = actorId
      }
    }
    return headers
  } catch {
    return {}
  }
}

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get("_medusa_cache_id")?.value

    if (!cacheId) {
      return ""
    }

    return `${tag}-${cacheId}`
  } catch {
    return ""
  }
}

type CacheOptions = { tags: string[] } | Record<string, never>

export const getCacheOptions = async (tag: string): Promise<CacheOptions> => {
  if (typeof window !== "undefined") {
    return {}
  }

  const cacheTag = await getCacheTag(tag)

  if (!cacheTag) {
    return {}
  }

  return { tags: [cacheTag] }
}

export const getCartId = async () => {
  const cookies = await nextCookies()
  return cookies.get("_medusa_cart_id")?.value
}

export const setCartId = async (cartId: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  })
}

export const removeCartId = async () => {
  const cookies = await nextCookies()

  // Delete cookie with domain (if set)
  if (COOKIE_DOMAIN) {
    cookies.set("_medusa_cart_id", "", {
      maxAge: -1,
      path: "/",
      domain: COOKIE_DOMAIN,
    })
  }

  // Also delete cookie without domain to handle cookies set without domain
  cookies.set("_medusa_cart_id", "", {
    maxAge: -1,
    path: "/",
  })

  // Use delete as well to ensure removal
  cookies.delete("_medusa_cart_id")
}

export const setAuthToken = async (token: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  })
}

export const removeAuthToken = async () => {
  const cookies = await nextCookies()

  // Delete cookie with domain (if set)
  if (COOKIE_DOMAIN) {
    cookies.set("_medusa_jwt", "", {
      maxAge: -1,
      path: "/",
      domain: COOKIE_DOMAIN,
    })
  }

  // Also delete cookie without domain to handle cookies set without domain
  cookies.set("_medusa_jwt", "", {
    maxAge: -1,
    path: "/",
  })

  // Use delete as well to ensure removal
  cookies.delete("_medusa_jwt")
}
