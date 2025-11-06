import type { Metadata } from "next"
import { JetBrains_Mono, Open_Sans } from "next/font/google"
import "./globals.css"

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background-primary">
      <body
        className={`${openSans.variable} ${jetBrainsMono.variable} antialiased bg-background-primary text-foreground-primary`}
      >
        {children}
      </body>
    </html>
  )
}
