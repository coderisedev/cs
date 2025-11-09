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

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@cs/medusa-client"],
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
      ...(strapiRemotePattern ? [strapiRemotePattern] : []),
    ],
  },
}

export default nextConfig
