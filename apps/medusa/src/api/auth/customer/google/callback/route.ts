import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { OAuth2Client } from "google-auth-library"
import crypto from "crypto"

async function signJwtHS256(payload: Record<string, any>, secret: string) {
  const header = { alg: "HS256", typ: "JWT" }
  const enc = (obj: any) => Buffer.from(JSON.stringify(obj)).toString("base64url")
  const data = `${enc(header)}.${enc(payload)}`
  const sig = crypto.createHmac("sha256", secret).update(data).digest().toString("base64url")
  return `${data}.${sig}`
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const code = req.query.code as string | undefined
  const state = req.query.state as string | undefined

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_OAUTH_CALLBACK_URL
  const jwtSecret = process.env.JWT_SECRET || "supersecret"

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).json({ error: "Google OAuth not configured" })
  }
  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" })
  }

  try {
    const oauth = new OAuth2Client({ clientId, clientSecret, redirectUri })
    const { tokens } = await oauth.getToken({ code, redirect_uri: redirectUri })
    const idToken = tokens.id_token
    if (!idToken) {
      return res.status(401).json({ error: "Missing id_token from Google" })
    }

    const ticket = await oauth.verifyIdToken({ idToken, audience: clientId })
    const payload = ticket.getPayload() || {}
    const email = String(payload.email || "")
    const emailVerified = Boolean(payload.email_verified)
    const sub = String(payload.sub || "")

    if (!email || !emailVerified) {
      return res.status(401).json({ error: "Google email missing or not verified" })
    }

    // Ensure a Customer exists (create if missing)
    const customerModule: any = req.scope.resolve("customer")
    let customerId: string | undefined

    try {
      // Try list by email
      const [customers] = await customerModule.listAndCount?.({ email })
      if (Array.isArray(customers) && customers.length) {
        customerId = customers[0].id
      }
    } catch {}

    if (!customerId) {
      try {
        const created = await customerModule.create?.({ email })
        customerId = created?.id || created?.[0]?.id
      } catch (e) {
        // Try retrieveByEmail if available
        try {
          const byEmail = await customerModule.retrieveByEmail?.(email)
          customerId = byEmail?.id
        } catch {}
      }
    }

    if (!customerId) {
      return res.status(500).json({ error: "Unable to ensure customer record" })
    }

    // Issue a customer session JWT with actor_id
    const now = Math.floor(Date.now() / 1000)
    const exp = now + 60 * 60 * 24 * 7 // 7 days
    const token = await signJwtHS256(
      {
        actor_type: "customer",
        actor_id: customerId,
        iat: now,
        exp,
        provider: "google",
        // Optionally include mapping identifiers
        sub,
      },
      jwtSecret
    )

    return res.json({ token, state })
  } catch (err: any) {
    const msg = err?.message || String(err)
    return res.status(500).json({ error: msg })
  }
}

