"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import {
  type ConsentPreferences,
  type ConsentState,
  type RegionType,
  CONSENT_VERSION,
} from "@/lib/consent/types"
import {
  getConsentCookie,
  setConsentCookie,
  getConsentTimestamp,
  getConsentVersion,
} from "@/lib/consent/cookie-manager"
import {
  getRegionType,
  getDefaultPreferences,
  requiresExplicitConsent,
} from "@/lib/consent/region-rules"

type ConsentContextValue = {
  /** Current consent state */
  state: ConsentState
  /** Whether the banner should be shown */
  showBanner: boolean
  /** Whether the preferences modal is open */
  showPreferences: boolean
  /** Accept all cookies */
  acceptAll: () => void
  /** Reject all non-essential cookies */
  rejectAll: () => void
  /** Update specific preferences */
  updatePreferences: (preferences: Partial<ConsentPreferences>) => void
  /** Check if analytics consent is given */
  hasAnalyticsConsent: () => boolean
  /** Check if marketing consent is given */
  hasMarketingConsent: () => boolean
  /** Open preferences modal */
  openPreferences: () => void
  /** Close preferences modal */
  closePreferences: () => void
  /** Close banner (after consent choice) */
  closeBanner: () => void
}

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined)

interface ConsentProviderProps {
  children: ReactNode
  /** Country code for region detection */
  countryCode?: string
}

export function ConsentProvider({
  children,
  countryCode = "us",
}: ConsentProviderProps) {
  const [regionType, setRegionType] = useState<RegionType>("default")
  const [hasConsented, setHasConsented] = useState(false)
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true,
    analytics: true,
    marketing: true,
  })
  const [consentTimestamp, setConsentTimestamp] = useState<string | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Initialize on mount - read from cookie
  useEffect(() => {
    // Determine region type
    const region = getRegionType(countryCode)
    setRegionType(region)

    // Try to read existing consent from cookie
    const savedPreferences = getConsentCookie()
    const savedTimestamp = getConsentTimestamp()
    const savedVersion = getConsentVersion()

    if (savedPreferences && savedVersion === CONSENT_VERSION) {
      // User has previously consented
      setPreferences(savedPreferences)
      setConsentTimestamp(savedTimestamp)
      setHasConsented(true)
      setShowBanner(false)
    } else {
      // No consent or outdated version - set defaults based on region
      const defaults = getDefaultPreferences(region)
      setPreferences(defaults)
      setHasConsented(false)
      // Show banner for all regions (GDPR, CCPA, and default)
      setShowBanner(true)
    }

    setIsHydrated(true)
  }, [countryCode])

  // Save preferences to cookie
  const savePreferences = useCallback((newPreferences: ConsentPreferences) => {
    setConsentCookie(newPreferences)
    setPreferences(newPreferences)
    setConsentTimestamp(new Date().toISOString())
    setHasConsented(true)
    setShowBanner(false)
  }, [])

  const acceptAll = useCallback(() => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
    })
  }, [savePreferences])

  const rejectAll = useCallback(() => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
    })
  }, [savePreferences])

  const updatePreferences = useCallback(
    (updates: Partial<ConsentPreferences>) => {
      const newPreferences: ConsentPreferences = {
        ...preferences,
        ...updates,
        essential: true, // Always true
      }
      savePreferences(newPreferences)
    },
    [preferences, savePreferences]
  )

  const hasAnalyticsConsent = useCallback(() => {
    // If not hydrated, check region default for GDPR
    if (!isHydrated) {
      return !requiresExplicitConsent(regionType)
    }

    // If user has consented, use their preference
    if (hasConsented) {
      return preferences.analytics
    }

    // If no consent yet, follow region rules
    // GDPR: Block until explicit consent
    // CCPA/Default: Allow until explicit opt-out
    return !requiresExplicitConsent(regionType)
  }, [isHydrated, hasConsented, preferences.analytics, regionType])

  const hasMarketingConsent = useCallback(() => {
    if (!isHydrated) {
      return !requiresExplicitConsent(regionType)
    }

    if (hasConsented) {
      return preferences.marketing
    }

    return !requiresExplicitConsent(regionType)
  }, [isHydrated, hasConsented, preferences.marketing, regionType])

  const openPreferences = useCallback(() => {
    setShowPreferences(true)
  }, [])

  const closePreferences = useCallback(() => {
    setShowPreferences(false)
  }, [])

  const closeBanner = useCallback(() => {
    setShowBanner(false)
  }, [])

  const state: ConsentState = {
    hasConsented,
    preferences,
    consentTimestamp,
    consentVersion: CONSENT_VERSION,
    regionType,
  }

  return (
    <ConsentContext.Provider
      value={{
        state,
        showBanner: isHydrated && showBanner,
        showPreferences,
        acceptAll,
        rejectAll,
        updatePreferences,
        hasAnalyticsConsent,
        hasMarketingConsent,
        openPreferences,
        closePreferences,
        closeBanner,
      }}
    >
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  const context = useContext(ConsentContext)
  if (!context) {
    throw new Error("useConsent must be used within ConsentProvider")
  }
  return context
}

/**
 * Hook to check if analytics tracking is allowed
 * Can be used outside of React components
 */
export function useAnalyticsConsent(): boolean {
  const { hasAnalyticsConsent } = useConsent()
  return hasAnalyticsConsent()
}
