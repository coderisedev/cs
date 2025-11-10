import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"

const FALLBACK_BASE_URL = "https://example.com"

export const buildDefaultAccountPath = (countryCode: string = DEFAULT_COUNTRY_CODE) =>
  `/${countryCode}/account`

export const sanitizeRedirectPath = (
  target: unknown,
  fallback: string = buildDefaultAccountPath()
) => {
  if (typeof target !== "string") {
    return fallback
  }

  const trimmed = target.trim()
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback
  }

  try {
    const url = new URL(trimmed, FALLBACK_BASE_URL)
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
