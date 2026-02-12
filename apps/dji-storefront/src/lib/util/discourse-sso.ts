import crypto from "crypto"

const DISCOURSE_URL = process.env.DISCOURSE_URL ?? ""
const DISCOURSE_SSO_SECRET = process.env.DISCOURSE_SSO_SECRET ?? ""
const DISCOURSE_API_KEY = process.env.DISCOURSE_API_KEY ?? ""
const DISCOURSE_API_USERNAME = process.env.DISCOURSE_API_USERNAME ?? "system"

/**
 * Verify the HMAC-SHA256 signature on a DiscourseConnect payload.
 */
export function verifyDiscoursePayload(
  sso: string,
  sig: string,
  secret: string = DISCOURSE_SSO_SECRET
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(sso)
    .digest("hex")
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(sig, "hex")
  )
}

/**
 * Decode a Base64-encoded DiscourseConnect payload and extract its parameters.
 */
export function decodePayload(sso: string): {
  nonce: string
  return_sso_url: string
} {
  const decoded = Buffer.from(sso, "base64").toString("utf8")
  const params = new URLSearchParams(decoded)
  const nonce = params.get("nonce")
  const returnUrl = params.get("return_sso_url")

  if (!nonce) {
    throw new Error("Missing nonce in Discourse SSO payload")
  }
  if (!returnUrl) {
    throw new Error("Missing return_sso_url in Discourse SSO payload")
  }

  return { nonce, return_sso_url: returnUrl }
}

/**
 * Build a Base64-encoded response payload to send back to Discourse.
 */
export function buildResponsePayload(params: {
  nonce: string
  external_id: string
  email: string
  username?: string
  name?: string
  avatar_url?: string
  suppress_welcome_message?: boolean
}): string {
  const payload = new URLSearchParams()
  payload.set("nonce", params.nonce)
  payload.set("external_id", params.external_id)
  payload.set("email", params.email)

  if (params.username) payload.set("username", params.username)
  if (params.name) payload.set("name", params.name)
  if (params.avatar_url) payload.set("avatar_url", params.avatar_url)
  if (params.suppress_welcome_message) {
    payload.set("suppress_welcome_message", "true")
  }

  return Buffer.from(payload.toString()).toString("base64")
}

/**
 * Sign a Base64-encoded payload with the shared secret using HMAC-SHA256.
 */
export function signPayload(
  payload: string,
  secret: string = DISCOURSE_SSO_SECRET
): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

/**
 * Validate that a return_sso_url belongs to the configured Discourse instance.
 */
export function isValidReturnUrl(returnUrl: string): boolean {
  if (!DISCOURSE_URL) return false
  try {
    const parsed = new URL(returnUrl)
    const expected = new URL(DISCOURSE_URL)
    return parsed.origin === expected.origin
  } catch {
    return false
  }
}

/**
 * Call Discourse sync_sso API to create or update a user.
 * Used by Medusa subscriber and logout flow.
 */
export async function syncDiscourseUser(params: {
  external_id: string
  email: string
  username?: string
  name?: string
  avatar_url?: string
  suppress_welcome_message?: boolean
}): Promise<void> {
  if (!DISCOURSE_URL || !DISCOURSE_SSO_SECRET || !DISCOURSE_API_KEY) {
    console.warn("[discourse] sync skipped: missing configuration")
    return
  }

  const payload = buildResponsePayload({
    ...params,
    nonce: crypto.randomUUID(),
  })
  const sig = signPayload(payload)

  const response = await fetch(`${DISCOURSE_URL}/admin/users/sync_sso`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Api-Key": DISCOURSE_API_KEY,
      "Api-Username": DISCOURSE_API_USERNAME,
    },
    body: new URLSearchParams({ sso: payload, sig }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error(
      `[discourse] sync_sso failed (${response.status}): ${text.slice(0, 200)}`
    )
  }
}

/**
 * Look up a Discourse user by external_id, then log them out.
 */
export async function logoutDiscourseUser(
  externalId: string
): Promise<void> {
  if (!DISCOURSE_URL || !DISCOURSE_API_KEY) {
    console.warn("[discourse] logout skipped: missing configuration")
    return
  }

  // Step 1: Find Discourse user ID by external_id
  const lookupRes = await fetch(
    `${DISCOURSE_URL}/users/by-external/${encodeURIComponent(externalId)}.json`,
    {
      headers: {
        "Api-Key": DISCOURSE_API_KEY,
        "Api-Username": DISCOURSE_API_USERNAME,
      },
    }
  )

  if (!lookupRes.ok) {
    if (lookupRes.status === 404) {
      // User not in Discourse yet, nothing to log out
      return
    }
    const text = await lookupRes.text()
    console.error(
      `[discourse] user lookup failed (${lookupRes.status}): ${text.slice(0, 200)}`
    )
    return
  }

  const userData = await lookupRes.json()
  const discourseUserId = userData?.user?.id

  if (!discourseUserId) {
    console.warn(`[discourse] no Discourse user found for external_id=${externalId}`)
    return
  }

  // Step 2: Log out the user
  const logoutRes = await fetch(
    `${DISCOURSE_URL}/admin/users/${discourseUserId}/log_out`,
    {
      method: "POST",
      headers: {
        "Api-Key": DISCOURSE_API_KEY,
        "Api-Username": DISCOURSE_API_USERNAME,
      },
    }
  )

  if (!logoutRes.ok) {
    const text = await logoutRes.text()
    console.error(
      `[discourse] logout failed (${logoutRes.status}): ${text.slice(0, 200)}`
    )
  }
}
