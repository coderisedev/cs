import { Metadata } from "next"
import { ResetPasswordClient } from "@/components/auth/reset-password-client"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Reset Password - Cockpit Simulator",
  description: "Create a new password for your Cockpit Simulator account",
}

type ResetPasswordPageProps = {
  params: Promise<{ countryCode?: string }>
  searchParams: Promise<{ token?: string; email?: string }>
}

export default async function ResetPasswordPage({
  params,
  searchParams,
}: ResetPasswordPageProps) {
  const resolvedParams = (await params) ?? {}
  const resolvedSearchParams = await searchParams
  const countryCode = resolvedParams.countryCode ?? DEFAULT_COUNTRY_CODE
  const token = resolvedSearchParams.token ?? ""
  const email = resolvedSearchParams.email ?? ""

  return (
    <ResetPasswordClient
      countryCode={countryCode}
      token={token}
      email={email}
    />
  )
}
