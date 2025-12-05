"use client"

import { useState, useActionState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  loginAction,
  initiateRegistrationAction,
  verifyOTPAction,
  completeRegistrationAction,
  resendOTPAction,
  type InitiateRegistrationResult,
  type VerifyOTPResult,
  type CompleteRegistrationResult,
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

type ViewType = "signin" | "register" | "verify-otp" | "complete-profile"

type LoginClientProps = {
  returnTo?: string
  countryCode?: string
}

export function LoginClient({
  returnTo,
  countryCode = DEFAULT_COUNTRY_CODE,
}: LoginClientProps) {
  const [currentView, setCurrentView] = useState<ViewType>("signin")
  const [pendingEmail, setPendingEmail] = useState("")
  const [otpValue, setOtpValue] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  // Form actions
  const [loginMessage, loginFormAction, loginPending] = useActionState(loginAction, null)
  const [initiateResult, initiateFormAction, initiatePending] = useActionState<InitiateRegistrationResult | null, FormData>(
    initiateRegistrationAction,
    null
  )
  const [verifyResult, verifyFormAction, verifyPending] = useActionState<VerifyOTPResult | null, FormData>(
    verifyOTPAction,
    null
  )
  const [completeResult, completeFormAction, completePending] = useActionState<CompleteRegistrationResult | string | null, FormData>(
    completeRegistrationAction,
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

  // Handle initiate registration result
  useEffect(() => {
    if (initiateResult?.success && initiateResult.email) {
      setPendingEmail(initiateResult.email)
      setCurrentView("verify-otp")
      setResendCooldown(60) // Start 60s cooldown
    }
  }, [initiateResult])

  // Handle OTP verification result
  useEffect(() => {
    if (verifyResult?.success && verifyResult.verified) {
      setCurrentView("complete-profile")
    }
  }, [verifyResult])

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
      const result = await resendOTPAction(pendingEmail)
      if (result.success) {
        setResendCooldown(60)
        setResendMessage("New code sent!")
        setOtpValue("")
      } else if (result.retry_after) {
        setResendCooldown(result.retry_after)
        setResendMessage(result.error || null)
      } else {
        setResendMessage(result.error || "Failed to resend code")
      }
    } catch {
      setResendMessage("Failed to resend code")
    } finally {
      setResendLoading(false)
    }
  }, [pendingEmail, resendCooldown, resendLoading])

  // Go back to email input
  const handleBackToEmail = () => {
    setCurrentView("register")
    setOtpValue("")
    setResendCooldown(0)
    setResendMessage(null)
  }

  // Get error message from complete result
  const getCompleteError = (): string | null => {
    if (!completeResult) return null
    if (typeof completeResult === "string") return completeResult
    if ("error" in completeResult) return completeResult.error || null
    return null
  }

  return (
    <div className="px-4 py-16 sm:py-20 bg-gradient-to-b from-background via-background-secondary/30 to-background">
      <div className="relative mx-auto max-w-md">
        <div className="absolute inset-0 -z-10 rounded-[36px] bg-primary-500/10 blur-3xl" aria-hidden />
        <div className="absolute inset-x-6 top-6 -z-10 h-32 rounded-full bg-primary-500/5 blur-2xl" aria-hidden />
        {requiresLoginForFlow && currentView === "signin" && (
          <div className="mb-6 rounded-base border border-border-primary bg-background-secondary px-4 py-3 text-sm text-foreground-secondary">
            Please sign in to continue to <span className="font-medium text-foreground-primary">{redirectTarget}</span>.
          </div>
        )}

        {/* Sign In View */}
        {currentView === "signin" && (
          <Card className="shadow-xl shadow-primary-500/10 border-border-primary/70">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to access your account and enjoy an enhanced shopping experience.
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
              <form action={loginFormAction} className="space-y-4">
                <input type="hidden" name="returnTo" value={redirectTarget} />
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    disabled={loginPending}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href={`/${countryCode}/forgot-password`}
                      className="text-xs text-primary-500 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    disabled={loginPending}
                  />
                </div>
                {loginMessage && (
                  <div className="p-3 rounded-base bg-red-50 border border-red-200 text-sm text-red-600">
                    {loginMessage}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loginPending}>
                  {loginPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-foreground-secondary">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setCurrentView("register")}
                  className="text-primary-500 hover:underline font-medium"
                  disabled={loginPending}
                >
                  Create an account
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Register - Email Entry View */}
        {currentView === "register" && (
          <Card className="shadow-xl shadow-primary-500/10 border-border-primary/70">
            <CardHeader>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>
                Enter your email to get started. We&apos;ll send you a verification code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {googleLoginAvailable && (
                <div className="mb-6 space-y-4">
                  {isGoogleOAuthPopupEnabled && <GoogleOAuthPopupButton returnTo={redirectTarget} />}
                  {isGoogleOneTapEnabled && <GoogleOneTapButton returnTo={redirectTarget} />}
                  <div className="text-center text-xs uppercase tracking-wide text-foreground-muted">
                    or continue with email
                  </div>
                </div>
              )}
              <form action={initiateFormAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
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
                      Continue with Email
                    </>
                  )}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-foreground-secondary">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setCurrentView("signin")}
                  className="text-primary-500 hover:underline font-medium"
                  disabled={initiatePending}
                >
                  Sign in
                </button>
              </div>
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
              <CardTitle className="text-2xl">Verify Your Email</CardTitle>
              <CardDescription>
                We&apos;ve sent a 6-digit code to <span className="font-medium text-foreground-primary">{pendingEmail}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={verifyFormAction} className="space-y-6">
                <input type="hidden" name="email" value={pendingEmail} />
                <input type="hidden" name="otp" value={otpValue} />
                <div className="space-y-2">
                  <Label className="sr-only">Verification Code</Label>
                  <OTPInput
                    value={otpValue}
                    onChange={setOtpValue}
                    disabled={verifyPending}
                  />
                </div>
                {verifyResult?.error && (
                  <div className="p-3 rounded-base bg-red-50 border border-red-200 text-sm text-red-600">
                    {verifyResult.error}
                  </div>
                )}
                {resendMessage && !verifyResult?.error && (
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
            </CardContent>
          </Card>
        )}

        {/* Complete Profile View */}
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
                <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    disabled={completePending}
                    minLength={8}
                    placeholder="At least 8 characters"
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
