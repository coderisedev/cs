import { NextRequest, NextResponse } from "next/server"
import { setAuthToken } from "@/lib/server/cookies"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }
    await setAuthToken(token)
    console.log(`[auth] session cookie set at`, new Date().toISOString())
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to set session"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
