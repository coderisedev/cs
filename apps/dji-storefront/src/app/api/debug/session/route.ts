import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const jar = await cookies()
    const hasJwt = Boolean(jar.get("_medusa_jwt")?.value)
    const hasCart = Boolean(jar.get("_medusa_cart_id")?.value)
    return NextResponse.json({ ok: true, hasJwt, hasCart }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

