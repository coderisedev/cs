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
