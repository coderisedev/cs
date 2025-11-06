import type { Metadata } from "next"
import { JetBrains_Mono, Open_Sans } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { mockMedusaClient } from "@cs/medusa-client"

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-open-sans",
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "DJI Storefront",
  description:
    "DJI design-system storefront scaffold derived from the cockpit simulator reference.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cart = await mockMedusaClient.retrieveCart()
  return (
    <html lang="en" className="bg-background-primary">
      <body
        className={`${openSans.variable} ${jetBrainsMono.variable} antialiased bg-background-primary text-foreground-primary`}
      >
        <SiteHeader cartItemCount={cart.items.length} />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
