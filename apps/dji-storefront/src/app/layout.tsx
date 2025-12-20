import type { Metadata } from "next"
import { Suspense } from "react"

// Temporarily disabled due to Turbopack font loading issues
// import { JetBrains_Mono, Open_Sans } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { ResellerRecruitment } from "@/components/homepage/reseller-recruitment"
import { PostHogProvider } from "@/components/providers/posthog-provider"
import { retrieveCart } from "@/lib/data/cart"

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
    "DJI design-system storefront scaffold derived from the cockpit simulator reference.",
  icons: {
    icon: "/favicon.ico",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cart = await retrieveCart()
  return (
    <html lang="en" className="bg-background-primary" suppressHydrationWarning>
      <body className="antialiased bg-background-primary text-foreground-primary" suppressHydrationWarning>
        <Suspense fallback={null}>
          <PostHogProvider>
            <SiteHeader cartItemCount={cart?.items?.length ?? 0} />
            <main>{children}</main>
            <ResellerRecruitment />
            <SiteFooter />
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  )
}
