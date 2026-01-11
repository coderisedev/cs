"use client"

import { useActionState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordResetAction } from "@/lib/actions/auth"
import { Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"

type ForgotPasswordClientProps = {
  countryCode: string
}

type ActionState = {
  success?: boolean
  message?: string
  error?: string
} | null

export function ForgotPasswordClient({ countryCode }: ForgotPasswordClientProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    requestPasswordResetAction,
    null
  )

  return (
    <div className="px-4 py-16 sm:py-20 bg-gradient-to-b from-background via-background-secondary/30 to-background">
      <div className="relative mx-auto max-w-md">
        <div className="absolute inset-0 -z-10 rounded-[36px] bg-primary-500/10 blur-3xl" aria-hidden />
        <div className="absolute inset-x-6 top-6 -z-10 h-32 rounded-full bg-primary-500/5 blur-2xl" aria-hidden />

        <Card className="shadow-xl shadow-primary-500/10 border-border-primary/70">
          <CardHeader>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state?.success ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground-primary mb-2">
                      Check Your Email
                    </h3>
                    <p className="text-foreground-secondary text-sm">
                      {state.message}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border-primary">
                  <p className="text-xs text-foreground-muted text-center mb-4">
                    Didn&apos;t receive the email? Check your spam folder or try again.
                  </p>
                  <Link href={`/${countryCode}/login`}>
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <form action={formAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        disabled={isPending}
                        className="pl-10"
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
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href={`/${countryCode}/login`}
                    className="text-sm text-foreground-secondary hover:text-primary-500 inline-flex items-center"
                  >
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
