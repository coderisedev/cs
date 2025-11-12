import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

function safeDecode(base64url: string) {
  try {
    const b64 = base64url.replace(/-/g, "+").replace(/_/g, "/")
    const json = Buffer.from(b64, "base64").toString("utf8")
    return JSON.parse(json)
  } catch {
    return null
  }
}

export async function GET() {
  const jar = await cookies()
  const jwt = jar.get("_medusa_jwt")?.value
  if (!jwt) {
    return NextResponse.json({ ok: false, error: "Missing _medusa_jwt" }, { status: 200 })
  }
  const [h, p] = jwt.split(".")
  const header = h ? safeDecode(h) : null
  const payload = p ? safeDecode(p) : null
  const redacted = payload
    ? {
        sub: payload.sub,
        email: payload.email || payload.mail || payload.preferred_username || undefined,
        actor_type: payload.actor_type,
        iss: payload.iss,
        aud: payload.aud,
        iat: payload.iat,
        exp: payload.exp,
        provider: payload.provider,
      }
    : null
  return NextResponse.json({ ok: true, header, claims: redacted }, { status: 200 })
}

