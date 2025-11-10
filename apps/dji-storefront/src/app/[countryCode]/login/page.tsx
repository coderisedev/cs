import { Metadata } from "next"
import { LoginClient } from "@/components/auth/login-client"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"
import { buildDefaultAccountPath, sanitizeRedirectPath } from "@/lib/util/redirect"

export const metadata: Metadata = {
  title: "Sign In · DJI Storefront",
  description: "Sign in to your DJI Storefront account",
}

type LoginPageProps = {
  params: { countryCode: string }
  searchParams?: Record<string, string | string[] | undefined>
}

export default function LoginPage({ params, searchParams }: LoginPageProps) {
  const countryCode = params?.countryCode ?? DEFAULT_COUNTRY_CODE
  const fallbackRedirect = buildDefaultAccountPath(countryCode)
  const requestedReturnTo = searchParams?.returnTo
  const returnToValue = Array.isArray(requestedReturnTo)
    ? requestedReturnTo[0]
    : requestedReturnTo
  const sanitizedReturnTo = sanitizeRedirectPath(returnToValue, fallbackRedirect)

  return <LoginClient returnTo={sanitizedReturnTo} countryCode={countryCode} />
}
