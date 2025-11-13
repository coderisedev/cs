import { Metadata } from "next"
import { LoginClient } from "@/components/auth/login-client"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"
import { buildDefaultAccountPath, sanitizeRedirectPath } from "@/lib/util/redirect"

export const metadata: Metadata = {
  title: "Sign In · Cockpit Simulator",
  description: "Sign in to your Cockpit Simulator account",
}

type LoginPageProps = {
  params: Promise<{ countryCode?: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const resolvedParams = (await params) ?? {}
  const countryCode = resolvedParams.countryCode ?? DEFAULT_COUNTRY_CODE
  const fallbackRedirect = buildDefaultAccountPath(countryCode)
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const requestedReturnTo = resolvedSearchParams?.returnTo
  const returnToValue = Array.isArray(requestedReturnTo)
    ? requestedReturnTo[0]
    : requestedReturnTo
  const sanitizedReturnTo = sanitizeRedirectPath(returnToValue, fallbackRedirect)

  return <LoginClient returnTo={sanitizedReturnTo} countryCode={countryCode} />
}
