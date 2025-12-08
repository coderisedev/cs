import { NextResponse } from "next/server"
import { getCollectionByHandle } from "@/lib/data/collections"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const handle = url.searchParams.get("handle") || "airbus320"

  const results: Record<string, unknown> = {
    handle,
    timestamp: new Date().toISOString(),
  }

  try {
    const collection = await getCollectionByHandle(handle)
    results.collection = {
      found: !!collection,
      id: collection?.id,
      title: collection?.title,
      handle: collection?.handle,
      metadata: collection?.metadata,
      metadataKeys: collection?.metadata ? Object.keys(collection.metadata) : [],
    }
  } catch (error) {
    results.collection = {
      found: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }

  return NextResponse.json(results)
}
