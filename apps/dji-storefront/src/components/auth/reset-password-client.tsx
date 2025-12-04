"use client"

import { useActionState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPasswordAction } from "@/lib/actions/auth"
import { Loader2, Lock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

type ResetPasswordClientProps = {
  countryCode: string
  token: string
  email: string
}

type ActionState = {
  success?: boolean
  message?: string
  error?: string
} | null

export function ResetPasswordClient({
  countryCode,
  token,
  email,
}: ResetPasswordClientProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    resetPasswordAction,
    null
  )

  const isValidLink = token && email

  return (
    <div className="px-4 py-16 sm:py-20 bg-gradient-to-b from-background via-background-secondary/30 to-background">
      <div className="relative mx-auto max-w-md">
        <div className="absolute inset-0 -z-10 rounded-[36px] bg-primary-500/10 blur-3xl" aria-hidden />
        <div className="absolute inset-x-6 top-6 -z-10 h-32 rounded-full bg-primary-500/5 blur-2xl" aria-hidden />

        <Card className="shadow-xl shadow-primary-500/10 border-border-primary/70">
          <CardHeader>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              {isValidLink
                ? "Create a new password for your account."
                : "Invalid or expired reset link."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isValidLink ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground-primary mb-2">
                      Invalid Reset Link
                    </h3>
                    <p className="text-foreground-secondary text-sm">
                      This password reset link is invalid or has expired. Please request a new one.
                    </p>
                  </div>
                </div>
                <Link href={`/${countryCode}/forgot-password`}>
                  <Button className="w-full">Request New Reset Link</Button>
                </Link>
              </div>
            ) : state?.success ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground-primary mb-2">
                      Password Reset Successful
                    </h3>
                    <p className="text-foreground-secondary text-sm">
                      {state.message}
                    </p>
                  </div>
                </div>
                <Link href={`/${countryCode}/login`}>
                  <Button className="w-full">Sign In</Button>
                </Link>
              </div>
            ) : (
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="email" value={email} />

                <div className="p-3 rounded-base bg-background-secondary border border-border-primary text-sm">
                  <span className="text-foreground-muted">Resetting password for: </span>
                  <span className="font-medium text-foreground-primary">{email}</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      autoComplete="new-password"
                      disabled={isPending}
                      className="pl-10"
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-foreground-muted">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      autoComplete="new-password"
                      disabled={isPending}
                      className="pl-10"
                      minLength={8}
                    />
                  </div>
                </div>

                {state?.error && (
                  <div className="p-3 rounded-base bg-red-50 border border-red-200 text-sm text-red-600">
                    {state.error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
