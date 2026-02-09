"use client"

import { useState, useActionState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  initiateOTPLoginAction,
  verifyOTPLoginAction,
  completeOTPProfileAction,
  resendOTPLoginAction,
  type InitiateOTPLoginResult,
  type VerifyOTPLoginResult,
  type CompleteOTPProfileResult,
} from "@/lib/actions/auth"
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react"
import {
  GoogleOneTapButton,
  OAuthPopupButton,
  isDiscordOAuthEnabled,
  isFacebookOAuthEnabled,
  isGoogleOAuthPopupEnabled,
  isGoogleOneTapEnabled,
  DiscordGlyph,
  FacebookGlyph,
  GoogleGlyph,
} from "@/components/auth/google-one-tap-button"
import type { OAuthProviderId } from "@/lib/auth/providers"
import { OTPInput } from "@/components/auth/otp-input"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"

type ViewType = "email-entry" | "verify-otp" | "complete-profile"

type LoginClientProps = {
  returnTo?: string
  countryCode?: string
}

export function LoginClient({
  returnTo,
  countryCode = DEFAULT_COUNTRY_CODE,
}: LoginClientProps) {
  const [currentView, setCurrentView] = useState<ViewType>("email-entry")
  const [pendingEmail, setPendingEmail] = useState("")
  const [otpValue, setOtpValue] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [errorDismissed, setErrorDismissed] = useState(false)

  // Form actions
  const [initiateResult, initiateFormAction, initiatePending] = useActionState<InitiateOTPLoginResult | null, FormData>(
    initiateOTPLoginAction,
    null
  )
  const [verifyResult, verifyFormAction, verifyPending] = useActionState<VerifyOTPLoginResult | string | null, FormData>(
    verifyOTPLoginAction,
    null
  )
  const [completeResult, completeFormAction, completePending] = useActionState<CompleteOTPProfileResult | string | null, FormData>(
    completeOTPProfileAction,
    null
  )

  const defaultRedirect = `/${countryCode}/account`
  const redirectTarget = returnTo ?? defaultRedirect
  const requiresLoginForFlow = redirectTarget !== defaultRedirect
  const popupButtons: Array<{
    id: OAuthProviderId
    label: string
    enabled: boolean
    icon: ReactNode
  }> = [
    {
      id: "google",
      label: "Sign in with Google",
      enabled: isGoogleOAuthPopupEnabled,
      icon: <GoogleGlyph />,
    },
    {
      id: "discord",
      label: "Sign in with Discord",
      enabled: isDiscordOAuthEnabled,
      icon: <DiscordGlyph />,
    },
    {
      id: "facebook",
      label: "Continue with Facebook",
      enabled: isFacebookOAuthEnabled,
      icon: <FacebookGlyph />,
    },
  ]

  const activePopupButtons = popupButtons.filter((button) => button.enabled)
  const showSocialLogin = isGoogleOneTapEnabled || activePopupButtons.length > 0

  // Clear stale error when user starts typing a new OTP
  const handleOtpChange = (value: string) => {
    setOtpValue(value)
    if (value) setErrorDismissed(true)
  }

  // Reset error dismissal when a new verify result arrives
  useEffect(() => {
    setErrorDismissed(false)
  }, [verifyResult])

  // Handle initiate result
  useEffect(() => {
    if (initiateResult?.success && initiateResult.email) {
      setPendingEmail(initiateResult.email)
      setCurrentView("verify-otp")
      setResendCooldown(60)
    }
  }, [initiateResult])

  // Get error message from verify result
  const getVerifyError = useCallback((): string | null => {
    if (!verifyResult) return null
    if (typeof verifyResult === "string") return verifyResult
    if ("error" in verifyResult) return verifyResult.error || null
    return null
  }, [verifyResult])

  // Handle OTP verification result
  useEffect(() => {
    if (verifyResult && typeof verifyResult !== "string") {
      if (verifyResult.success && verifyResult.requiresProfile) {
        setCurrentView("complete-profile")
      }
    }
  }, [verifyResult])

  // Clear OTP input when verification error occurs, detect terminal errors
  useEffect(() => {
    const error = getVerifyError()
    if (error) {
      setOtpValue("")  // Clear input so user can retry with fresh input
      // Check if this is a terminal error (max attempts reached, session expired)
      if (error.includes("Too many failed attempts") || error.includes("expired") || error.includes("start again")) {
        setSessionExpired(true)
      }
    }
  }, [getVerifyError])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Handle resend OTP
  const handleResendOTP = useCallback(async () => {
    if (resendCooldown > 0 || resendLoading) return

    setResendLoading(true)
    setResendMessage(null)

    try {
      const result = await resendOTPLoginAction(pendingEmail)
      if (result.success) {
        setResendCooldown(60)
        setResendMessage("New code sent!")
        setOtpValue("")
      } else if (result.retry_after) {
        setResendCooldown(result.retry_after)
        setResendMessage(result.error || null)
      } else {
        // Check if this is a terminal error (session expired/deleted after max attempts)
        const errorMsg = result.error || "Failed to resend code"
        if (errorMsg.includes("start again") || errorMsg.includes("not found") || errorMsg.includes("No pending")) {
          setSessionExpired(true)
          setResendMessage("Session expired. Please start over.")
        } else {
          setResendMessage(errorMsg)
        }
      }
    } catch {
      setResendMessage("Failed to resend code")
    } finally {
      setResendLoading(false)
    }
  }, [pendingEmail, resendCooldown, resendLoading])

  // Go back to email input
  const handleBackToEmail = () => {
    setCurrentView("email-entry")
    setOtpValue("")
    setResendCooldown(0)
    setResendMessage(null)
    setSessionExpired(false)
  }

  // Get error message from complete result
  const getCompleteError = (): string | null => {
    if (!completeResult) return null
    if (typeof completeResult === "string") return completeResult
    if ("error" in completeResult) return completeResult.error || null
    return null
  }

  return (
    <div className="px-3 xs:px-4 py-12 xs:py-16 sm:py-20 bg-gradient-to-b from-background via-background-secondary/30 to-background safe-bottom">
      <div className="relative mx-auto max-w-md">
        <div className="absolute inset-0 -z-10 rounded-[36px] bg-primary-500/10 blur-3xl" aria-hidden />
        <div className="absolute inset-x-6 top-6 -z-10 h-32 rounded-full bg-primary-500/5 blur-2xl" aria-hidden />
        {requiresLoginForFlow && currentView === "email-entry" && (
          <div className="mb-6 rounded-base border border-border-primary bg-background-secondary px-4 py-3 text-sm text-foreground-secondary">
            Please sign in to continue to <span className="font-medium text-foreground-primary">{redirectTarget}</span>.
          </div>
        )}

        {/* Email Entry View */}
        {currentView === "email-entry" && (
          <Card className="shadow-xl shadow-primary-500/10 border-border-primary/70">
            <CardHeader>
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>
                Enter your email to sign in or create an account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showSocialLogin && (
                <div className="mb-6 space-y-4">
                  {activePopupButtons.map((button) => (
                    <OAuthPopupButton
                      key={button.id}
                      provider={button.id}
                      label={button.label}
                      icon={button.icon}
                      returnTo={redirectTarget}
                      enabled={button.enabled}
                    />
                  ))}
                  {isGoogleOneTapEnabled && <GoogleOneTapButton returnTo={redirectTarget} />}
                  <div className="text-center text-xs uppercase tracking-wide text-foreground-muted">
                    or continue with email
                  </div>
                </div>
              )}
              <form action={initiateFormAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    disabled={initiatePending}
                    defaultValue={pendingEmail}
                  />
                </div>
                {initiateResult?.error && (
                  <div className="p-3 rounded-base bg-red-50 border border-red-200 text-sm text-red-600">
                    {initiateResult.error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={initiatePending}>
                  {initiatePending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Continue
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* OTP Verification View */}
        {currentView === "verify-otp" && (
          <Card className="shadow-xl shadow-primary-500/10 border-border-primary/70">
            <CardHeader>
              <button
                type="button"
                onClick={handleBackToEmail}
                className="flex items-center text-sm text-foreground-secondary hover:text-foreground-primary mb-2 -ml-1"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </button>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription>
                We&apos;ve sent a 6-digit code to <span className="font-medium text-foreground-primary">{pendingEmail}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={verifyFormAction} className="space-y-6">
                <input type="hidden" name="email" value={pendingEmail} />
                <input type="hidden" name="otp" value={otpValue} />
                <input type="hidden" name="returnTo" value={redirectTarget} />
                <div className="space-y-2">
                  <Label className="sr-only">Verification Code</Label>
                  <OTPInput
                    value={otpValue}
                    onChange={handleOtpChange}
                    disabled={verifyPending}
                  />
                </div>
                {!errorDismissed && getVerifyError() && (
                  <div className="p-3 rounded-base bg-red-50 border border-red-200 text-sm text-red-600">
                    {getVerifyError()}
                  </div>
                )}
                {resendMessage && !getVerifyError() && (
                  <div className={`p-3 rounded-base text-sm ${resendMessage.includes("sent") ? "bg-green-50 border border-green-200 text-green-600" : "bg-yellow-50 border border-yellow-200 text-yellow-600"}`}>
                    {resendMessage}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyPending || otpValue.length !== 6}
                >
                  {verifyPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
              </form>
              {sessionExpired ? (
                <div className="mt-6 text-center">
                  <p className="text-sm text-foreground-secondary mb-3">
                    Your session has expired. Please start over to get a new code.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToEmail}
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Start Over
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mt-6 text-center text-sm text-foreground-secondary">
                    Didn&apos;t receive the code?{" "}
                    {resendCooldown > 0 ? (
                      <span className="text-foreground-muted">
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-primary-500 hover:underline font-medium"
                        disabled={resendLoading}
                      >
                        {resendLoading ? "Sending..." : "Resend code"}
                      </button>
                    )}
                  </div>
                  <p className="mt-4 text-center text-xs text-foreground-muted">
                    Code expires in 10 minutes
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Complete Profile View (new users only) */}
        {currentView === "complete-profile" && (
          <Card className="shadow-xl shadow-primary-500/10 border-border-primary/70">
            <CardHeader>
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Email verified</span>
              </div>
              <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
              <CardDescription>
                Just a few more details to set up your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={completeFormAction} className="space-y-4">
                <input type="hidden" name="email" value={pendingEmail} />
                <input type="hidden" name="returnTo" value={redirectTarget} />
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      autoComplete="given-name"
                      disabled={completePending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      autoComplete="family-name"
                      disabled={completePending}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    disabled={completePending}
                  />
                </div>
                {getCompleteError() && (
                  <div className="p-3 rounded-base bg-red-50 border border-red-200 text-sm text-red-600">
                    {getCompleteError()}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={completePending}>
                  {completePending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
              <p className="mt-6 text-center text-xs text-foreground-muted">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
