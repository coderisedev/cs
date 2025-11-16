"use client"

import { ReactNode, useCallback, useEffect, useRef, useState } from "react"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { getPopupSource, OAuthProviderId } from "@/lib/auth/providers"

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const GOOGLE_ONE_TAP_ENABLED = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_ONE_TAP === "true"
const GOOGLE_OAUTH_POPUP_ENABLED = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH_POPUP === "true"
const DISCORD_OAUTH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DISCORD_OAUTH === "true"
const FACEBOOK_OAUTH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_OAUTH === "true"
const ADDITIONAL_POPUP_ORIGINS = (process.env.NEXT_PUBLIC_AUTH_POPUP_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

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
export const isDiscordOAuthEnabled = DISCORD_OAUTH_ENABLED
export const isFacebookOAuthEnabled = FACEBOOK_OAUTH_ENABLED

export const GoogleGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    className="h-4 w-4"
  >
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.9-.1-1.6-.3-2.3H12v4.3h6.5c-.3 1.6-1.3 3-2.9 3.9v3.2h4.7c2.8-2.5 3.2-6.2 3.2-9.1z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.2 0 5.9-1.1 7.9-3l-4.7-3.2c-.8.5-1.8.9-3.2.9-2.5 0-4.6-1.7-5.3-4H1.8v3.3C3.8 21.8 7.6 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M6.7 14.7c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H1.8C.9 9.1.4 11 .4 13s.5 3.9 1.4 5.6l4.9-3.9z"
    />
    <path
      fill="#EA4335"
      d="M12 4.8c1.8 0 3.3.6 4.5 1.7l3.4-3.4C17.9 1.2 15.2 0 12 0 7.6 0 3.8 2.2 1.8 5.4l4.9 3.9c.7-2.3 2.8-4.5 5.3-4.5z"
    />
  </svg>
)

export const DiscordGlyph = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" focusable="false">
    <path
      fill="#5865F2"
      d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.07.07 0 00-.073.034c-.211.375-.444.864-.608 1.25a18.248 18.248 0 00-5.363 0 12.63 12.63 0 00-.617-1.25.076.076 0 00-.073-.034c-1.7.321-3.34.86-4.885 1.515a.064.064 0 00-.03.025C.533 9.043-.319 13.58.099 18.063a.08.08 0 00.031.055c2.052 1.507 4.043 2.422 5.992 3.029a.077.077 0 00.084-.028c.461-.63.873-1.295 1.226-1.999a.076.076 0 00-.041-.104c-.652-.247-1.27-.548-1.871-.889a.077.077 0 01-.008-.129c.125-.094.25-.19.37-.29a.076.076 0 01.081-.01c3.927 1.793 8.18 1.793 12.062 0a.076.076 0 01.082.009c.12.1.245.197.37.291a.077.077 0 01-.006.129 12.299 12.299 0 01-1.872.888.076.076 0 00-.04.105c.361.703.773 1.368 1.225 1.998a.076.076 0 00.084.029c1.957-.607 3.948-1.522 6-3.03a.077.077 0 00.03-.054c.5-5.177-.838-9.68-3.548-13.666a.061.061 0 00-.03-.025zM8.02 15.331c-1.183 0-2.155-1.086-2.155-2.419 0-1.333.951-2.419 2.155-2.419 1.214 0 2.176 1.096 2.155 2.419 0 1.333-.951 2.419-2.155 2.419zm7.975 0c-1.183 0-2.155-1.086-2.155-2.419 0-1.333.951-2.419 2.155-2.419 1.214 0 2.176 1.096 2.155 2.419 0 1.333-.941 2.419-2.155 2.419z"
    />
  </svg>
)

export const FacebookGlyph = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" focusable="false">
    <path
      fill="#1877F2"
      d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.764v2.314h3.587l-.467 3.622h-3.12V24h6.116C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z"
    />
  </svg>
)

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

type OAuthPopupButtonProps = {
  provider: OAuthProviderId
  label: string
  icon?: ReactNode
  returnTo: string
  enabled: boolean
}

export function OAuthPopupButton({
  provider,
  label,
  icon,
  returnTo,
  enabled,
}: OAuthPopupButtonProps) {
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

    const handleMessage = async (event: MessageEvent) => {
      const origin = event.origin
      const selfOrigin = window.location.origin
      const allowedOrigins = new Set([selfOrigin, ...ADDITIONAL_POPUP_ORIGINS])

      if (!allowedOrigins.has(origin)) {
        return
      }

      const data = event.data as {
        source?: string
        success?: boolean
        redirectUrl?: string
        error?: string
        token?: string
      }

      if (data?.source !== getPopupSource(provider)) {
        return
      }

      closePopup()
      setLaunching(false)

      if (data.success && data.redirectUrl) {
        if (data.token) {
          try {
            await fetch("/api/auth/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ token: data.token }),
            })
            await new Promise((r) => setTimeout(r, 100))
          } catch {
            // non-fatal
          }
        }
        if (typeof window !== "undefined") {
          window.location.href = data.redirectUrl
          return
        }
      }

      setError(data.error ?? `${label} sign-in was cancelled or failed`)
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [closePopup, provider, label])

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

  if (!enabled) {
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
    const origin = window.location.origin
    const popupUrl = new URL(`${origin}/auth/${provider}`)
    popupUrl.searchParams.set("returnTo", returnTo)

    const popup = window.open(popupUrl.toString(), `${provider}-oauth-popup`, features)

    if (!popup) {
      setLaunching(false)
      setError("Popup was blocked. Please allow popups for this site or use email login.")
      return
    }

    popupRef.current = popup
  }

  const iconNode = icon ?? <GoogleGlyph />

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-center gap-2 border-border-primary bg-card hover:bg-card/90"
        disabled={launching}
        onClick={openPopup}
      >
        {launching ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Opening {label}...
          </>
        ) : (
          <>
            {iconNode}
            <span>{label}</span>
          </>
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
