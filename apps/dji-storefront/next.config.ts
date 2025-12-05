import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

const strapiRemotePattern = (() => {
  const rawUrl = process.env.STRAPI_API_URL ?? "http://localhost:1337"
  try {
    const parsed = new URL(rawUrl)
    const protocol = parsed.protocol.replace(":", "")
    if (protocol !== "http" && protocol !== "https") {
      return undefined
    }
    return {
      protocol: protocol as "http" | "https",
      hostname: parsed.hostname,
    } as const
  } catch {
    return undefined
  }
})()

// Vercel's project root is already `apps/dji-storefront`, but its deployment target prepends the
// configured root directory once more. Emit builds into a nested folder on Vercel only so the CLI
// can locate `.next/routes-manifest.json`, while keeping local builds in the default `.next`.
const distDir = process.env.VERCEL ? "apps/dji-storefront/.next" : ".next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@cs/medusa-client"],
  distDir,
  eslint: {
    // Next 15 bundles ESLint 9 during builds, which currently crashes on deprecated CLI flags.
    // Disable build-time lint to unblock deploys and rely on pnpm lint instead.
    ignoreDuringBuilds: true,
  },
  // Allow cross-origin requests from development domains
  allowedDevOrigins: ["dev.aidenlux.com"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "img.aidenlux.com",
      },
      ...(strapiRemotePattern ? [strapiRemotePattern] : []),
    ],
    // Configure allowed image quality values (required in Next.js 16+)
    qualities: [50, 75, 80, 85, 90, 95, 100],
  },
}

// Wrap with Sentry configuration for error tracking and performance monitoring
export default withSentryConfig(nextConfig, {
  // Sentry organization and project slugs
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Control source map upload behavior
  sourcemaps: {
    // Automatically delete source maps after upload
    deleteSourcemapsAfterUpload: true,
  },

  // Automatically instrument React components for performance monitoring
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to avoid ad-blockers
  tunnelRoute: "/monitoring",
})
