import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { ICustomerModuleService } from "@medusajs/types"
import { Modules } from "@medusajs/utils"
import crypto from "crypto"

const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token"
const DISCORD_USER_URL = "https://discord.com/api/users/@me"

type DiscordTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope?: string
}

type DiscordUserResponse = {
  id: string
  username: string
  global_name?: string
  display_name?: string
  email?: string
  verified?: boolean
  avatar?: string
}

async function signJwtHS256(payload: Record<string, any>, secret: string) {
  const header = { alg: "HS256", typ: "JWT" }
  const encode = (obj: any) => Buffer.from(JSON.stringify(obj)).toString("base64url")
  const data = `${encode(header)}.${encode(payload)}`
  const signature = crypto.createHmac("sha256", secret).update(data).digest().toString("base64url")
  return `${data}.${signature}`
}

async function exchangeCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  scope: string
) {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    scope,
  })

  const response = await fetch(DISCORD_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error(`Discord token exchange failed (${response.status})`)
  }

  return (await response.json()) as DiscordTokenResponse
}

async function fetchDiscordProfile(accessToken: string) {
  const response = await fetch(DISCORD_USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error(`Discord profile lookup failed (${response.status})`)
  }

  return (await response.json()) as DiscordUserResponse
}

async function ensureCustomer(req: MedusaRequest, email: string) {
  const customerService = req.scope.resolve(Modules.CUSTOMER) as ICustomerModuleService
  const [existing] = await customerService.listCustomers({ email }, { take: 1 })
  if (existing) {
    return existing
  }
  return customerService.createCustomers({ email })
}

async function handleCallback(
  req: MedusaRequest,
  res: MedusaResponse,
  code: string | undefined,
  state?: string
) {
  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET
  const redirectUri = process.env.DISCORD_OAUTH_CALLBACK_URL
  const scope = process.env.DISCORD_SCOPE ?? "identify email"
  const jwtSecret = process.env.JWT_SECRET || "supersecret"

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).json({ error: "Discord OAuth not configured" })
  }

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" })
  }

  try {
    const tokenResponse = await exchangeCode(code, clientId, clientSecret, redirectUri, scope)
    const profile = await fetchDiscordProfile(tokenResponse.access_token)

    if (!profile?.email || profile.verified === false) {
      return res
        .status(401)
        .json({ error: "Discord account email missing or unverified" })
    }

    const customer = await ensureCustomer(req, profile.email)
    const now = Math.floor(Date.now() / 1000)
    const exp = now + 60 * 60 * 24 * 7
    const token = await signJwtHS256(
      {
        actor_type: "customer",
        actor_id: customer.id,
        iat: now,
        exp,
        provider: "discord",
        sub: profile.id,
        email: profile.email,
        username: profile.username,
      },
      jwtSecret
    )

    return res.json({ token, state })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Discord OAuth failed"
    return res.status(500).json({ error: message })
  }
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = (req.query ?? {}) as Record<string, unknown>
  const code = typeof query.code === "string" ? query.code : undefined
  const state = typeof query.state === "string" ? query.state : undefined
  return handleCallback(req, res, code, state)
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = (req.body ?? {}) as Record<string, unknown>
  const query = (req.query ?? {}) as Record<string, unknown>
  const code =
    (typeof body.code === "string" ? body.code : undefined) ??
    (typeof query.code === "string" ? query.code : undefined)
  const state =
    (typeof body.state === "string" ? body.state : undefined) ??
    (typeof query.state === "string" ? query.state : undefined)
  return handleCallback(req, res, code, state)
}
