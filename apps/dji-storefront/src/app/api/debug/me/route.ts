import { NextResponse } from "next/server"
import { sdk } from "@/lib/medusa"
import { getAuthHeaders } from "@/lib/server/cookies"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const headers = await getAuthHeaders()
    const res = await sdk.client.fetch(`/store/customers/me`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    return NextResponse.json({ ok: true, status: 200, body: res }, { status: 200 })
  } catch (error: unknown) {
    const status =
      typeof error === "object" && error !== null && "status" in error && typeof (error as { status?: unknown }).status === "number"
        ? ((error as { status: number }).status)
        : 500
    const body =
      typeof error === "object" && error !== null && "body" in error
        ? (error as { body?: unknown }).body
        : error instanceof Error
          ? error.message
          : String(error)
    return NextResponse.json({ ok: false, status, body }, { status: 200 })
  }
}
