import { ReactNode } from "react"

export default function CountryLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { countryCode: string }
}) {
  // Plan A: countryCode is always "us" due to middleware
  return <>{children}</>
}
