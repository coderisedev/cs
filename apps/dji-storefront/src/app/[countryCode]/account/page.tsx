import { AccountClient } from "@/components/account/account-client"
import { getAccountPageData } from "@/lib/data/account"
import { redirect } from "next/navigation"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"

export const metadata = {
  title: "Account · DJI Storefront",
}

type AccountPageProps = {
  params: Promise<{ countryCode?: string }>
}

export default async function AccountPage({ params }: AccountPageProps) {
  const resolvedParams = (await params) ?? {}
  const countryCode = resolvedParams.countryCode ?? DEFAULT_COUNTRY_CODE
  const data = await getAccountPageData()

  if (!data.user) {
    const target = encodeURIComponent(`/${countryCode}/account`)
    redirect(`/${countryCode}/login?returnTo=${target}`)
  }

  return <AccountClient user={data.user} orders={data.orders} wishlist={data.wishlist} />
}
