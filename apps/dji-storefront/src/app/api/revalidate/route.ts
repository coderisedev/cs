import { NextResponse } from "next/server"
import { revalidateStrapiBlog, BLOG_CACHE_TAG } from "@/lib/data/blog"

const handleRequest = async (request: Request) => {
  const url = new URL(request.url)
  const tag = url.searchParams.get("tag")

  if (!isAuthorized(url)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  if (!tag) {
    return NextResponse.json({ success: false, error: "Missing tag" }, { status: 400 })
  }

  if (tag === BLOG_CACHE_TAG) {
    await revalidateStrapiBlog()
    return NextResponse.json({ success: true, tag })
  }

  return NextResponse.json({ success: false, error: "Unsupported tag" }, { status: 400 })
}

const isAuthorized = (url: URL) => {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    return true
  }
  return url.searchParams.get("secret") === secret
}

export async function POST(request: Request) {
  return handleRequest(request)
}

export async function GET(request: Request) {
  return handleRequest(request)
}
