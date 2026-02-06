"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Cookie, Settings } from "lucide-react"
import { useConsent } from "@/lib/context/consent-context"
import { Button } from "@/components/ui/button"

/**
 * Cookie consent banner
 * Displays at the bottom of the page for first-time visitors
 */
export function CookieBanner() {
  const { showBanner, acceptAll, rejectAll, openPreferences } = useConsent()

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-description"
        >
          <div className="bg-background-elevated border-t border-border-primary shadow-lg">
            <div className="container mx-auto px-3 xs:px-4 lg:px-12 py-4 md:py-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                {/* Icon and text */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10 text-primary-500 shrink-0">
                    <Cookie className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2
                      id="cookie-banner-title"
                      className="text-base font-semibold text-foreground-primary mb-1"
                    >
                      We value your privacy
                    </h2>
                    <p
                      id="cookie-banner-description"
                      className="text-sm text-foreground-secondary"
                    >
                      We use cookies to enhance your browsing experience, analyze
                      site traffic, and serve personalized content. By clicking
                      &quot;Accept All&quot;, you consent to our use of cookies.
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col xs:flex-row gap-2 md:gap-3 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openPreferences}
                    className="order-3 xs:order-1"
                    aria-label="Customize cookie settings"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={rejectAll}
                    className="order-2"
                    aria-label="Reject all non-essential cookies"
                  >
                    Reject All
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={acceptAll}
                    className="order-1 xs:order-3"
                    aria-label="Accept all cookies"
                  >
                    Accept All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
