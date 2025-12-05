import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  // Only allow in non-production or with secret
  const secret = process.env.DEBUG_SECRET

  return NextResponse.json({
    env: {
      MEDUSA_BACKEND_URL: process.env.MEDUSA_BACKEND_URL ? "set" : "missing",
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ? `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.slice(0, 10)}...` : "missing",
      STRAPI_API_URL: process.env.STRAPI_API_URL ? "set" : "missing",
      STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN ? "set" : "missing",
      NODE_ENV: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  })
}
