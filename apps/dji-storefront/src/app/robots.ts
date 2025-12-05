import type { MetadataRoute } from "next"

const BASE_URL = process.env.STOREFRONT_BASE_URL || "https://dev.aidenlux.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/account/",
          "/checkout/",
          "/cart/",
          "/_next/",
          "/actions/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
