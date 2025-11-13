import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { OAuth2Client, TokenPayload } from "google-auth-library"
import crypto from "crypto"
import type { ICustomerModuleService } from "@medusajs/types"
import { Modules } from "@medusajs/utils"

async function signJwtHS256(payload: Record<string, any>, secret: string) {
  const header = { alg: "HS256", typ: "JWT" }
  const encode = (obj: any) => Buffer.from(JSON.stringify(obj)).toString("base64url")
  const data = `${encode(header)}.${encode(payload)}`
  const signature = crypto.createHmac("sha256", secret).update(data).digest().toString("base64url")
  return `${data}.${signature}`
}

async function handleCallback(
  req: MedusaRequest,
  res: MedusaResponse,
  code: string | undefined,
  state?: string
) {
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

  const oauth = new OAuth2Client({ clientId, clientSecret, redirectUri })
  const { tokens } = await oauth.getToken({ code, redirect_uri: redirectUri })
  const idToken = tokens.id_token
  if (!idToken) {
    return res.status(401).json({ error: "Missing id_token from Google" })
  }

  const ticket = await oauth.verifyIdToken({ idToken, audience: clientId })
  const payload = (ticket.getPayload() ?? {}) as TokenPayload
  const email = payload.email ?? ""
  const emailVerified = Boolean(payload.email_verified)
  const sub = payload.sub ?? ""

  if (!email || !emailVerified) {
    return res.status(401).json({ error: "Google email missing or not verified" })
  }

  const customerService = req.scope.resolve(Modules.CUSTOMER) as ICustomerModuleService
  const [existing] = await customerService.listCustomers({ email }, { take: 1 })
  const customer =
    existing ??
    (await customerService.createCustomers({
      email,
    }))

  const now = Math.floor(Date.now() / 1000)
  const exp = now + 60 * 60 * 24 * 7
  const token = await signJwtHS256(
    {
      actor_type: "customer",
      actor_id: customer.id,
      iat: now,
      exp,
      provider: "google",
      sub,
      email,
    },
    jwtSecret
  )

  return res.json({ token, state })
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const query = (req.query ?? {}) as Record<string, unknown>
    const code = typeof query.code === "string" ? query.code : undefined
    const state = typeof query.state === "string" ? query.state : undefined
    return await handleCallback(req, res, code, state)
  } catch (err: any) {
    console.error("[medusa][google-oauth][GET]", err)
    const msg = err?.message || String(err)
    return res.status(500).json({ error: msg })
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>
    const query = (req.query ?? {}) as Record<string, unknown>
    const code =
      (typeof body.code === "string" ? body.code : undefined) ??
      (typeof query.code === "string" ? query.code : undefined)
    const state =
      (typeof body.state === "string" ? body.state : undefined) ??
      (typeof query.state === "string" ? query.state : undefined)
    return await handleCallback(req, res, code, state)
  } catch (err: any) {
    console.error("[medusa][google-oauth][POST]", err)
    const msg = err?.message || String(err)
    return res.status(500).json({ error: msg })
  }
}
