import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { headers } from "next/headers"

// Force dynamic rendering - disable all caching for testing
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

// Mobile viewport configuration for H5 optimization
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
}

// Temporarily disabled due to Turbopack font loading issues
// import { JetBrains_Mono, Open_Sans } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { ConsentProvider } from "@/lib/context/consent-context"
import { PostHogProvider } from "@/components/providers/posthog-provider"
import { CookieBanner } from "@/components/consent/cookie-banner"
import { CookiePreferences } from "@/components/consent/cookie-preferences"
import { retrieveCart } from "@/lib/data/cart"
import { listCollections } from "@/lib/data/collections"
import { isCountrySupported } from "@/lib/config/regions"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"

// Fallback to system fonts until Google Fonts issue is resolved
// const openSans = Open_Sans({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700"],
//   variable: "--font-open-sans",
// })

// const jetBrainsMono = JetBrains_Mono({
//   subsets: ["latin"],
//   weight: ["400", "500", "600"],
//   variable: "--font-jetbrains-mono",
// })

export const metadata: Metadata = {
  title: "Cockpit Simulator",
  description:
    "CS design-system storefront scaffold derived from the cockpit simulator reference.",
  icons: {
    icon: "/favicon.ico",
  },
}

/**
 * Extract country code from URL path
 * URL format: /{countryCode}/... (e.g., /sg/products, /us/checkout)
 */
async function getCountryCodeFromPath(): Promise<string> {
  const headersList = await headers()
  // x-pathname is set by Next.js middleware or we can use x-url
  const pathname = headersList.get('x-pathname') || headersList.get('x-url') || ''

  // Extract country code from path (e.g., "/sg/products" -> "sg")
  const match = pathname.match(/^\/([a-z]{2})(\/|$)/i)
  if (match) {
    const countryCode = match[1].toLowerCase()
    if (isCountrySupported(countryCode)) {
      return countryCode
    }
  }

  return DEFAULT_COUNTRY_CODE
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [cart, countryCode, { collections }] = await Promise.all([
    retrieveCart(),
    getCountryCodeFromPath(),
    listCollections(),
  ])
  return (
    <html lang="en" className="bg-background-primary" suppressHydrationWarning>
      <body className="antialiased bg-background-primary text-foreground-primary" suppressHydrationWarning>
        <Suspense fallback={null}>
          <ConsentProvider countryCode={countryCode}>
            <PostHogProvider>
              <SiteHeader cartItemCount={cart?.items?.length ?? 0} countryCode={countryCode} />
              <main>{children}</main>
              <SiteFooter countryCode={countryCode} collections={collections} />
              <CookieBanner />
              <CookiePreferences />
            </PostHogProvider>
          </ConsentProvider>
        </Suspense>
      </body>
    </html>
  )
}
