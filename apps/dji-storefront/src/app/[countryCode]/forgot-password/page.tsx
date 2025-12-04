import { Metadata } from "next"
import { ForgotPasswordClient } from "@/components/auth/forgot-password-client"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Forgot Password - Cockpit Simulator",
  description: "Reset your Cockpit Simulator account password",
}

type ForgotPasswordPageProps = {
  params: Promise<{ countryCode?: string }>
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const resolvedParams = (await params) ?? {}
  const countryCode = resolvedParams.countryCode ?? DEFAULT_COUNTRY_CODE

  return <ForgotPasswordClient countryCode={countryCode} />
}
