import type { NextConfig } from "next"

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
  },
}

export default nextConfig
