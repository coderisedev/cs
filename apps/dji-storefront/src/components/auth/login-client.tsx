"use client"

import { useState, useActionState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction, registerAction } from "@/lib/actions/auth"
import { Loader2 } from "lucide-react"
import { GoogleOneTapButton, isGoogleOneTapEnabled } from "@/components/auth/google-one-tap-button"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"

type ViewType = "signin" | "register"

type LoginClientProps = {
  returnTo?: string
  countryCode?: string
}

export function LoginClient({
  returnTo,
  countryCode = DEFAULT_COUNTRY_CODE,
}: LoginClientProps) {
  const [currentView, setCurrentView] = useState<ViewType>("signin")
  const [loginMessage, loginFormAction, loginPending] = useActionState(loginAction, null)
  const [registerMessage, registerFormAction, registerPending] = useActionState(registerAction, null)
  const defaultRedirect = `/${countryCode}/account`
  const redirectTarget = returnTo ?? defaultRedirect
  const requiresLoginForFlow = redirectTarget !== defaultRedirect

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        {requiresLoginForFlow && (
          <div className="mb-6 rounded-base border border-border-primary bg-background-secondary px-4 py-3 text-sm text-foreground-secondary">
            Please sign in to continue to <span className="font-medium text-foreground-primary">{redirectTarget}</span>.
          </div>
        )}
        {currentView === "signin" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to access your account and enjoy an enhanced shopping experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGoogleOneTapEnabled && (
                <div className="mb-6">
                  <GoogleOneTapButton returnTo={redirectTarget} />
                  <div className="mt-4 text-center text-xs uppercase tracking-wide text-foreground-muted">
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
                  <Label htmlFor="password">Password</Label>
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>
                Join DJI Storefront and get access to exclusive features and enhanced shopping experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={registerFormAction} className="space-y-4">
                <input type="hidden" name="returnTo" value={redirectTarget} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      autoComplete="given-name"
                      disabled={registerPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      autoComplete="family-name"
                      disabled={registerPending}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    disabled={registerPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    disabled={registerPending}
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
                    disabled={registerPending}
                  />
                </div>
                {registerMessage && (
                  <div className="p-3 rounded-base bg-red-50 border border-red-200 text-sm text-red-600">
                    {registerMessage}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={registerPending}>
                  {registerPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-foreground-secondary">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setCurrentView("signin")}
                  className="text-primary-500 hover:underline font-medium"
                  disabled={registerPending}
                >
                  Sign in
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
