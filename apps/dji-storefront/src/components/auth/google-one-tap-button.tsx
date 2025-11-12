"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const GOOGLE_ONE_TAP_ENABLED = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_ONE_TAP === "true"
const GOOGLE_OAUTH_POPUP_ENABLED = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH_POPUP === "true"

type CredentialResponse = {
  credential?: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: Record<string, unknown>) => void
          prompt: (callback?: (notification: Record<string, unknown>) => void) => void
          cancel: () => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

export const isGoogleOneTapEnabled = Boolean(GOOGLE_CLIENT_ID && GOOGLE_ONE_TAP_ENABLED)
export const isGoogleOAuthPopupEnabled = Boolean(GOOGLE_CLIENT_ID && GOOGLE_OAUTH_POPUP_ENABLED)

type GoogleOneTapButtonProps = {
  returnTo: string
  autoPrompt?: boolean
}

export function GoogleOneTapButton({ returnTo, autoPrompt = true }: GoogleOneTapButtonProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const [scriptLoadTimeout, setScriptLoadTimeout] = useState(false)
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const initializedRef = useRef(false)
  const promptedRef = useRef(false)

  const handleCredentialResponse = useCallback(
    async (response: CredentialResponse) => {
      if (!response?.credential || processing) {
        return
      }

      setProcessing(true)
      setError(null)

      try {
        const res = await fetch("/api/auth/google-one-tap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            credential: response.credential,
            returnTo,
          }),
        })

        const payload = await res.json()

        if (!res.ok || !payload?.success) {
          throw new Error(payload?.error ?? "Unable to sign in with Google")
        }

        router.push(payload.redirectUrl ?? returnTo)
        router.refresh()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Google sign-in failed"
        setError(message)
      } finally {
        setProcessing(false)
      }
    },
    [processing, returnTo, router]
  )

  // Detect script loading timeout (network issues, firewall, VPN required)
  useEffect(() => {
    if (!isGoogleOneTapEnabled || !GOOGLE_CLIENT_ID) {
      return
    }

    const timeout = setTimeout(() => {
      if (!scriptReady && !window.google?.accounts?.id) {
        setScriptLoadTimeout(true)
        setError(
          "Unable to load Google services. This may be due to network restrictions or firewall. " +
          "Please check your connection or use email login instead."
        )
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [scriptReady])

  useEffect(() => {
    if (!isGoogleOneTapEnabled || !GOOGLE_CLIENT_ID || !scriptReady) {
      return
    }

    if (typeof window === "undefined" || !window.google?.accounts?.id) {
      if (!scriptLoadTimeout) {
        setError("Google Identity Services unavailable in this environment")
      }
      return
    }

    if (!initializedRef.current) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      initializedRef.current = true
    }

    if (buttonRef.current && buttonRef.current.childElementCount === 0) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_blue",
        text: "continue_with",
        shape: "pill",
        size: "large",
        width: "100%",
      })
    }

    if (autoPrompt && !promptedRef.current) {
      window.google.accounts.id.prompt((notification) => {
        const notDisplayed =
          typeof notification === "object" && notification !== null
            ? (notification as { isNotDisplayed?: () => boolean }).isNotDisplayed
            : undefined
        if (typeof notDisplayed === "function" && notDisplayed()) {
          setError("Unable to show Google prompt. Please enable third-party cookies.")
        }
      })
      promptedRef.current = true
    }
  }, [autoPrompt, handleCredentialResponse, scriptReady, scriptLoadTimeout])

  if (!isGoogleOneTapEnabled || !GOOGLE_CLIENT_ID) {
    return null
  }

  return (
    <div className="space-y-3">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptReady(true)
          setScriptLoadTimeout(false)
        }}
        onError={() => {
          setError(
            "Failed to load Google services. This may indicate network restrictions. " +
            "Please use email login or check your VPN/firewall settings."
          )
        }}
      />
      <div className="flex flex-col gap-3">
        <div ref={buttonRef} className="flex justify-center" />
        <Button
          type="button"
          variant="ghost"
          className="w-full border border-border-primary"
          disabled={processing || scriptLoadTimeout || !scriptReady}
          onClick={() => {
            setError(null)
            if (typeof window !== "undefined" && window.google?.accounts?.id) {
              window.google.accounts.id.prompt((notification) => {
                if ((notification as { isNotDisplayed?: () => boolean })?.isNotDisplayed?.()) {
                  setError("Unable to show Google prompt. Please ensure third-party cookies are enabled.")
                }
              })
            } else if (!scriptReady) {
              setError("Google services are still loading, please wait...")
            }
          }}
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting to Google...
            </>
          ) : scriptLoadTimeout ? (
            "Google Login Unavailable"
          ) : !scriptReady ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading Google...
            </>
          ) : (
            "Use Google One Tap"
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

type GoogleOAuthPopupButtonProps = {
  returnTo: string
}

export function GoogleOAuthPopupButton({ returnTo }: GoogleOAuthPopupButtonProps) {
  const router = useRouter()
  const popupRef = useRef<Window | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [launching, setLaunching] = useState(false)

  const closePopup = useCallback(() => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close()
    }
    popupRef.current = null
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return
      }

      const data = event.data as {
        source?: string
        success?: boolean
        redirectUrl?: string
        error?: string
      }

      if (data?.source !== "google-oauth-popup") {
        return
      }

      closePopup()
      setLaunching(false)

      if (data.success && data.redirectUrl) {
        router.push(data.redirectUrl)
        router.refresh()
        return
      }

      setError(data.error ?? "Google sign-in was cancelled or failed")
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [closePopup, router])

  useEffect(() => {
    if (!launching || typeof window === "undefined") {
      return
    }

    const interval = window.setInterval(() => {
      if (!popupRef.current || popupRef.current.closed) {
        window.clearInterval(interval)
        setLaunching(false)
      }
    }, 500)

    return () => window.clearInterval(interval)
  }, [launching])

  if (!isGoogleOAuthPopupEnabled) {
    return null
  }

  const openPopup = () => {
    if (typeof window === "undefined") {
      return
    }

    setError(null)
    setLaunching(true)

    const width = 480
    const height = 640
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2)
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2)
    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    const url = `/auth/google?returnTo=${encodeURIComponent(returnTo)}`
    const popup = window.open(url, "google-oauth-popup", features)

    if (!popup) {
      setLaunching(false)
      setError("Popup was blocked. Please allow popups for this site or use email login.")
      return
    }

    popupRef.current = popup
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={launching}
        onClick={openPopup}
      >
        {launching ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Opening Google...
          </>
        ) : (
          "Continue with Google (Popup)"
        )}
      </Button>
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
