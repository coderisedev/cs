import { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/react"

import { getBaseURL } from "@lib/util/env"
import { ThemeProvider } from "@/providers/theme-provider"
import { AppToastProvider } from "@/providers/toast-provider"
import FeedbackWidget from "@/components/feedback/feedback-widget"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const feedbackUrl =
    process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL ||
    "mailto:dji-design@company.com?subject=DJI%20Design%20System%20Feedback"

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AppToastProvider>
            <main className="relative">{props.children}</main>
            {feedbackUrl ? <FeedbackWidget href={feedbackUrl} /> : null}
          </AppToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
