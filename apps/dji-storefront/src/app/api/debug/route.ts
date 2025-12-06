import { NextResponse } from "next/server"
import { getProductDetail } from "@/lib/data/products"
import { getProductDetailContent } from "@/lib/strapi/product-detail"
import { getReviewsByProduct } from "@/lib/data/reviews"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const handle = url.searchParams.get("handle") || "cs-737m-cdu"

  const results: Record<string, unknown> = {
    env: {
      MEDUSA_BACKEND_URL: process.env.MEDUSA_BACKEND_URL ? "set" : "missing",
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ? `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.slice(0, 10)}...` : "missing",
      STRAPI_API_URL: process.env.STRAPI_API_URL ? "set" : "missing",
      STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN ? "set" : "missing",
      SENTRY_DSN: process.env.SENTRY_DSN ? "set" : "missing",
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN ? "set" : "missing",
      NODE_ENV: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  }

  // Test Medusa API
  try {
    const product = await getProductDetail(handle, "us")
    results.medusa = {
      success: true,
      productFound: !!product,
      productTitle: product?.title || null,
      productPrice: product?.price,
      productImages: product?.images?.length || 0,
      productVariants: product?.variants?.length || 0,
      productRating: product?.rating,
      productReviewCount: product?.reviewCount,
    }

    // Test reviews
    if (product) {
      const reviews = getReviewsByProduct(product.id)
      results.reviews = {
        count: reviews.length,
      }
    }
  } catch (error) {
    results.medusa = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }
  }

  // Test Strapi API
  try {
    const strapiContent = await getProductDetailContent(handle)
    results.strapi = {
      success: true,
      contentFound: !!strapiContent,
      contentTitle: strapiContent?.title || null,
    }
  } catch (error) {
    results.strapi = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }

  return NextResponse.json(results)
}
