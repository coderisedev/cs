"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const GOOGLE_ONE_TAP_ENABLED = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_ONE_TAP === "true"

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

const loadGoogleScript = (() => {
  let loaderPromise: Promise<void> | null = null

  return () => {
    if (loaderPromise) {
      return loaderPromise
    }

    loaderPromise = new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined") {
        return resolve()
      }

      const existingScript = document.querySelector<HTMLScriptElement>("script[data-google-one-tap]")
      if (existingScript) {
        return resolve()
      }

      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      script.dataset.googleOneTap = "true"
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load Google Identity Services"))
      document.head.appendChild(script)
    })

    return loaderPromise
  }
})()

export const isGoogleOneTapEnabled = Boolean(GOOGLE_CLIENT_ID && GOOGLE_ONE_TAP_ENABLED)

type GoogleOneTapButtonProps = {
  returnTo: string
  autoPrompt?: boolean
}

export function GoogleOneTapButton({ returnTo, autoPrompt = true }: GoogleOneTapButtonProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
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

  useEffect(() => {
    if (!isGoogleOneTapEnabled || !GOOGLE_CLIENT_ID) {
      return
    }

    let cancelled = false

    loadGoogleScript()
      .then(() => {
        if (cancelled || typeof window === "undefined" || !window.google?.accounts?.id) {
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
          window.google.accounts.id.prompt()
          promptedRef.current = true
        }
      })
      .catch((err: Error) => {
        setError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [autoPrompt, handleCredentialResponse])

  if (!isGoogleOneTapEnabled || !GOOGLE_CLIENT_ID) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">
        <div ref={buttonRef} className="flex justify-center" />
        <Button
          type="button"
          variant="ghost"
          className="w-full border border-border-primary"
          disabled={processing}
          onClick={() => {
            setError(null)
            if (typeof window !== "undefined" && window.google?.accounts?.id) {
              window.google.accounts.id.prompt((notification) => {
                if ((notification as { isNotDisplayed?: () => boolean })?.isNotDisplayed?.()) {
                  setError("Unable to show Google prompt. Please ensure third-party cookies are enabled.")
                }
              })
            }
          }}
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting to Google...
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
