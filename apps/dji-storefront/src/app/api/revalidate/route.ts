import { NextResponse } from "next/server"
import { revalidateStrapiBlog, BLOG_CACHE_TAG } from "@/lib/data/blog"
import { revalidatePath, revalidateTag } from "next/cache"

const COLLECTIONS_CACHE_TAG = "collections"

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

  if (tag.startsWith("products-")) {
    await revalidateTag(tag)
    return NextResponse.json({ success: true, tag })
  }

  // Support collections revalidation - clears all collection pages
  if (tag === COLLECTIONS_CACHE_TAG || tag === "collections") {
    // Revalidate the collections listing page and all collection detail pages
    revalidatePath("/[countryCode]/collections", "page")
    revalidatePath("/[countryCode]/collections/[handle]", "page")
    return NextResponse.json({ success: true, tag, message: "Collections pages revalidated" })
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
